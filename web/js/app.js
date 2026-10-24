// OpenMoney Mobile Web Application Controller
import { store } from './store.js';
import { dbManager } from './db.js';
import { formatCurrency, parseCurrencyToCents, todayISO, formatDateBR, formatMonthBR, CARD_TYPE } from './models.js';

let activeDbName = null;
let currentTxType = 'despesa'; // 'despesa', 'receita', 'transferencia'
let activeAccountDetailId = null;
let activeAccountDetailFilter = 'month'; // 'month', 'all'
let selectedActionTxId = null;

// Collapsed state for account groups
const collapsedSections = {
  fav: false,
  active: false,
  inactive: true
};

// Initialize Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.warn('SW registration failed:', err);
    });
  });
}

// Toast notification helper
export function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// Modal open/close helpers with body scroll lock
function openModal(modal) {
  if (!modal) return;
  document.body.classList.add('modal-open');
  modal.classList.add('active');
}

function closeAllModals() {
  document.body.classList.remove('modal-open');
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  const dropdown = document.getElementById('payeeDropdown');
  if (dropdown) dropdown.classList.remove('show');
}

// App Initialization
async function initApp() {
  setupEventListeners();
  
  try {
    activeDbName = await dbManager.getActiveDbName();
    if (activeDbName) {
      const data = await dbManager.getDatabase(activeDbName);
      if (data) {
        store.setDatabase(data);
        renderDashboard();
        return;
      }
    }
    renderWelcome();
  } catch (err) {
    console.error('Initialization error:', err);
    renderWelcome();
  }
}

// Render Welcome View (First run or no database selected)
function renderWelcome() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container">
      <div class="welcome-card">
        <img src="icons/icon-192.png" alt="OpenMoney" class="welcome-icon">
        <h1 class="welcome-title">OpenMoney Mobile</h1>
        <p class="welcome-desc">
          Controle financeiro pessoal e patrimonial com soberania absoluta.
        </p>

        <!-- Passos de Instalação e Inicialização -->
        <div class="steps-card">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <div class="step-title">Instalar na Tela de Início (Recomendado)</div>
              <div class="step-desc">
                Toque no ícone de <strong>Compartilhar (↑)</strong> do Safari e escolha <strong>"Adicionar à Tela de Início"</strong> para rodar como App sem barra de navegador.
              </div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <div class="step-title">Selecionar sua Base do iCloud Drive</div>
              <div class="step-desc">
                Clique no botão abaixo para abrir seu arquivo <strong>.json</strong> (ex: <code>openmoney.json</code>). Ele será salvo localmente no aparelho.
              </div>
            </div>
          </div>
        </div>

        <button id="btnWelcomeChooseFile" class="btn-choose-file">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
          Abrir Base do iCloud (.json)
        </button>
        <input type="file" id="fileInputWelcome" accept=".json" style="display:none;">
      </div>
    </div>
  `;

  document.getElementById('btnWelcomeChooseFile').addEventListener('click', () => {
    document.getElementById('fileInputWelcome').click();
  });

  document.getElementById('fileInputWelcome').addEventListener('change', handleFileInput);
}

// Render Single Account Card
function renderAccountCard(a) {
  const b = store.calculateAccountBalance(a);
  const isCard = a.type === CARD_TYPE;
  const realClass = b.real < 0 ? 'text-negative' : (b.real > 0 ? 'text-positive' : 'text-neutral');
  const typeIcons = {
    "Corrente": { icon: "💳", cls: "icon-corrente" },
    "Poupança": { icon: "🏦", cls: "icon-poupanca" },
    "Cartão de crédito": { icon: "💳", cls: "icon-cartao" },
    "Investimento": { icon: "📈", cls: "icon-investimento" },
    "Dinheiro": { icon: "💵", cls: "icon-dinheiro" }
  };
  const iconInfo = typeIcons[a.type] || { icon: "💳", cls: "icon-corrente" };

  return `
    <div class="account-card" data-acc-id="${a.id}">
      <div class="account-info">
        <div class="account-icon ${iconInfo.cls}">
          ${iconInfo.icon}
        </div>
        <div class="account-details">
          <div class="name">
            ${a.favorite ? '<span class="badge-favorite">★</span> ' : ''}
            ${a.name}
            ${a.inactive ? '<span style="font-size:0.68rem;color:var(--text-muted);background:rgba(255,255,255,0.06);padding:2px 6px;border-radius:6px;margin-left:4px;">INATIVA</span>' : ''}
          </div>
          <div class="type">${isCard && a.card ? `Fecha dia ${a.card.closeDay} · Vence dia ${a.card.dueDay}` : a.type}</div>
        </div>
      </div>
      <div class="account-balances">
        <div class="real ${realClass}">${formatCurrency(b.real)}</div>
        ${b.pred !== b.real ? `<div class="pred">Previsto: ${formatCurrency(b.pred)}</div>` : ''}
      </div>
    </div>
  `;
}

// Render Dashboard View
function renderDashboard() {
  const app = document.getElementById('app');
  const nw = store.calculateTotalNetWorth();

  // 1. Contas Favoritas (se houver)
  const favAccounts = store.favoriteAccounts;
  let favSectionHtml = '';
  if (favAccounts.length > 0) {
    const isCollapsed = Boolean(collapsedSections.fav);
    let cards = favAccounts.map(a => renderAccountCard(a)).join('');
    favSectionHtml = `
      <div class="collapsible-header ${isCollapsed ? 'collapsed' : ''}" data-section="fav">
        <div class="title-wrap">
          <svg class="chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
          <span>⭐ Contas Favoritas</span>
        </div>
        <span class="badge-count">${favAccounts.length}</span>
      </div>
      <div class="collapsible-content ${isCollapsed ? 'collapsed' : ''}" id="sec-content-fav">
        ${cards}
      </div>
    `;
  }

  // 2. Contas Ativas (Padrão) agrupadas por tipo
  const activeAccounts = store.standardActiveAccounts;
  const isActCollapsed = Boolean(collapsedSections.active);
  let activeCardsHtml = '';
  const typeOrder = ["Corrente", "Poupança", "Cartão de crédito", "Investimento", "Dinheiro"];
  const byType = store.groupAccountsByType(activeAccounts);

  for (const type of typeOrder) {
    const list = byType[type] || [];
    if (list.length === 0) continue;
    activeCardsHtml += `
      <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin:8px 0 4px 6px;">${type}</div>
      ${list.map(a => renderAccountCard(a)).join('')}
    `;
  }

  const activeSectionHtml = `
    <div class="collapsible-header ${isActCollapsed ? 'collapsed' : ''}" data-section="active">
      <div class="title-wrap">
        <svg class="chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
        <span>Contas Ativas</span>
      </div>
      <span class="badge-count">${activeAccounts.length}</span>
    </div>
    <div class="collapsible-content ${isActCollapsed ? 'collapsed' : ''}" id="sec-content-active">
      ${activeCardsHtml || '<div style="color:var(--text-muted);font-size:0.85rem;padding:8px 12px;">Todas as contas estão nas Favoritas.</div>'}
    </div>
  `;

  // 3. Contas Inativas (se houver, recolhidas por padrão como no macOS)
  const inactAccounts = store.inactiveAccounts;
  let inactSectionHtml = '';
  if (inactAccounts.length > 0) {
    const isInactCollapsed = Boolean(collapsedSections.inactive);
    let cards = inactAccounts.map(a => renderAccountCard(a)).join('');
    inactSectionHtml = `
      <div class="collapsible-header ${isInactCollapsed ? 'collapsed' : ''}" data-section="inactive">
        <div class="title-wrap">
          <svg class="chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
          <span>📁 Contas Inativas</span>
        </div>
        <span class="badge-count">${inactAccounts.length}</span>
      </div>
      <div class="collapsible-content ${isInactCollapsed ? 'collapsed' : ''}" id="sec-content-inactive">
        ${cards}
      </div>
    `;
  }

  // Lançamentos de Hoje e Anteriores
  const todayData = store.getTodayTransactions();
  let recentHtml = '';
  
  if (todayData.count > 0) {
    let items = '';
    for (const t of todayData.transactions) {
      const isNeg = t.amt < 0;
      const acc = store.accountById(t.acc);
      items += `
        <div class="tx-clickable-row" data-tx-id="${t.id}" style="display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid var(--border-glass);">
          <div>
            <div style="font-weight:600;font-size:0.92rem;">${t.payee}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">${acc?.name || ''} · ${t.cat || 'Sem categoria'}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:700;font-size:0.95rem;" class="${isNeg ? 'text-negative' : 'text-positive'}">
              ${formatCurrency(t.amt)}
            </div>
            <div style="font-size:0.7rem;color:var(--text-muted);">${t.rec ? '✓ Efetivado' : 'Pendente'}</div>
          </div>
        </div>
      `;
    }

    recentHtml = `
      <div class="section-title" style="margin-top: 26px;">
        <span>Lançamentos de Hoje (${formatDateBR(todayISO())})</span>
        <span style="font-size:0.8rem;text-transform:none;color:var(--text-secondary);">${todayData.count} no dia</span>
      </div>
      <div style="background:var(--bg-card);border:1px solid var(--border-glass);border-radius:var(--radius-md);padding:8px 16px;">
        ${items}
      </div>
    `;
  } else {
    // No transactions today, show empty state plus last 3 past transactions
    const pastTxs = store.getRecentTransactions(null, 3, todayISO());
    let pastItems = '';
    for (const t of pastTxs) {
      const isNeg = t.amt < 0;
      const acc = store.accountById(t.acc);
      pastItems += `
        <div class="tx-clickable-row" data-tx-id="${t.id}" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-glass);">
          <div>
            <div style="font-weight:600;font-size:0.9rem;">${t.payee}</div>
            <div style="font-size:0.74rem;color:var(--text-muted);">${formatDateBR(t.date)} · ${acc?.name || ''}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:700;font-size:0.92rem;" class="${isNeg ? 'text-negative' : 'text-positive'}">
              ${formatCurrency(t.amt)}
            </div>
          </div>
        </div>
      `;
    }

    recentHtml = `
      <div class="section-title" style="margin-top: 26px;">
        <span>Lançamentos de Hoje</span>
      </div>
      <div style="background:var(--bg-card);border:1px solid var(--border-glass);border-radius:var(--radius-md);padding:14px 16px;margin-bottom:12px;color:var(--text-muted);font-size:0.85rem;text-align:center;">
        Nenhum lançamento registrado hoje (${formatDateBR(todayISO())}).
      </div>
      ${pastItems ? `
        <div class="section-title" style="margin-top: 14px;">
          <span>Últimos Lançamentos Anteriores</span>
        </div>
        <div style="background:var(--bg-card);border:1px solid var(--border-glass);border-radius:var(--radius-md);padding:8px 16px;">
          ${pastItems}
        </div>
      ` : ''}
    `;
  }

  app.innerHTML = `
    <header class="app-header">
      <div class="brand">
        <img src="icons/icon-192.png" alt="Icon" class="brand-icon">
        <div class="brand-title">OpenMoney</div>
      </div>
      <button id="btnSwitchDb" class="db-selector-pill" title="Alternar base de dados">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
        <span>${activeDbName || 'Base'}</span>
      </button>
    </header>

    <main class="container">
      <div class="net-worth-card">
        <div class="net-worth-label">Patrimônio Líquido</div>
        <div class="net-worth-amount ${nw.real < 0 ? 'text-negative' : 'text-positive'}">
          ${formatCurrency(nw.real)}
        </div>
        <div class="net-worth-sub">
          <span>Saldo Previsto no mês (${formatMonthBR(store.activeMonth)}):</span>
          <span class="val">${formatCurrency(nw.pred)}</span>
        </div>
      </div>

      <!-- Sync Banner com botões destacados e ícones -->
      <div class="sync-banner">
        <div>
          <strong>${activeDbName}</strong>
          <div style="color:var(--text-muted);font-size:0.75rem;">Base ativa no aparelho</div>
        </div>
        <div style="display:flex;gap:8px;">
          <button id="btnReloadICloud" class="sync-btn btn-reload-cloud">
            🔄 Atualizar do iCloud
          </button>
          <button id="btnSyncICloud" class="sync-btn btn-save-cloud">
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
            Salvar no iCloud
          </button>
        </div>
        <input type="file" id="fileInputReload" accept=".json" style="display:none;">
      </div>

      <!-- Contas Agrupadas Estilo macOS -->
      ${favSectionHtml}
      ${activeSectionHtml}
      ${inactSectionHtml}

      ${recentHtml}
    </main>

    <button id="btnOpenNewTx" class="fab-btn">
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
      Lançamento
    </button>
  `;

  // Attach Dashboard events
  document.getElementById('btnSwitchDb').addEventListener('click', openDatabaseSwitcher);
  document.getElementById('btnSyncICloud').addEventListener('click', syncCurrentDatabaseToICloud);
  document.getElementById('btnOpenNewTx').addEventListener('click', () => openNewTransactionModal());

  const btnReload = document.getElementById('btnReloadICloud');
  const fileReload = document.getElementById('fileInputReload');
  if (btnReload && fileReload) {
    btnReload.addEventListener('click', () => fileReload.click());
    fileReload.addEventListener('change', handleFileInput);
  }

  // Collapsible headers toggle
  document.querySelectorAll('.collapsible-header').forEach(header => {
    header.addEventListener('click', () => {
      const secKey = header.getAttribute('data-section');
      collapsedSections[secKey] = !collapsedSections[secKey];
      header.classList.toggle('collapsed', collapsedSections[secKey]);
      const content = document.getElementById(`sec-content-${secKey}`);
      if (content) {
        content.classList.toggle('collapsed', collapsedSections[secKey]);
      }
    });
  });

  // Account card click -> open details
  document.querySelectorAll('.account-card').forEach(card => {
    card.addEventListener('click', () => {
      const accId = card.getAttribute('data-acc-id');
      openAccountDetailsModal(accId);
    });
  });

  // Transaction row click -> open action sheet
  document.querySelectorAll('.tx-clickable-row').forEach(row => {
    row.addEventListener('click', () => {
      const txId = row.getAttribute('data-tx-id');
      openTransactionActionsModal(txId);
    });
  });
}

// Handle file input selection (from iCloud Drive or local file)
async function handleFileInput(e) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const result = await dbManager.importFromFile(file, true);
    activeDbName = result.name;
    store.setDatabase(result.data);
    closeAllModals();
    renderDashboard();

    if (result.mergedCount > 0) {
      showToast(`✓ Base ${result.name} atualizada (+${result.mergedCount} lançamentos mesclados)!`, 4000);
    } else {
      showToast(`✓ Base ${result.name} atualizada do iCloud!`);
    }
  } catch (err) {
    alert(`Erro ao importar base: ${err.message}`);
  }
}

// Sincronizar / Salvar no iCloud Drive
async function syncCurrentDatabaseToICloud() {
  if (!store.db || !activeDbName) return;
  try {
    const res = await dbManager.exportToFile(activeDbName, store.db);
    if (res.success) {
      showToast('Exportado com sucesso! Salve/Substitua na pasta do iCloud Drive.');
    }
  } catch (err) {
    alert(`Erro ao exportar base: ${err.message}`);
  }
}

// Database Switcher Modal
async function openDatabaseSwitcher() {
  const modal = document.getElementById('modalDbSwitcher');
  const listContainer = document.getElementById('dbListContainer');
  const dbs = await dbManager.listDatabases();

  let html = '';
  for (const item of dbs) {
    const isActive = item.name === activeDbName;
    html += `
      <div class="db-item ${isActive ? 'active' : ''}" data-name="${item.name}">
        <div>
          <div style="font-weight:600;font-size:0.95rem;color:var(--text-primary);">
            ${item.name} ${isActive ? '✓ (Ativa)' : ''}
          </div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">
            ${item.accountsCount} contas · ${item.txCount} lançamentos
          </div>
        </div>
        ${!isActive ? `<button class="btn-delete-db" data-name="${item.name}" style="background:none;border:none;color:var(--om-red);font-size:0.8rem;padding:6px;">Excluir</button>` : ''}
      </div>
    `;
  }

  listContainer.innerHTML = html;

  // Click on db item to switch
  listContainer.querySelectorAll('.db-item').forEach(item => {
    item.addEventListener('click', async (e) => {
      if (e.target.classList.contains('btn-delete-db')) return;
      const targetName = item.getAttribute('data-name');
      if (targetName !== activeDbName) {
        const data = await dbManager.getDatabase(targetName);
        if (data) {
          activeDbName = targetName;
          await dbManager.setActiveDbName(targetName);
          store.setDatabase(data);
          closeAllModals();
          renderDashboard();
          showToast(`Alternado para ${targetName}`);
        }
      }
    });
  });

  // Delete DB
  listContainer.querySelectorAll('.btn-delete-db').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const targetName = btn.getAttribute('data-name');
      if (confirm(`Remover "${targetName}" do dispositivo móvel? (O arquivo original no iCloud não será afetado)`)) {
        await dbManager.deleteDatabase(targetName);
        openDatabaseSwitcher();
      }
    });
  });

  openModal(modal);
}

// Account Details Modal (Filtered by Current Month or All)
function openAccountDetailsModal(accId) {
  activeAccountDetailId = accId;
  const acc = store.accountById(accId);
  if (!acc) return;

  const modal = document.getElementById('modalAccountDetails');
  const title = document.getElementById('accountDetailsTitle');
  const subtitle = document.getElementById('accountDetailsSubtitle');

  const b = store.calculateAccountBalance(acc);
  title.textContent = acc.name;
  subtitle.textContent = `Saldo Real: ${formatCurrency(b.real)} | Previsto: ${formatCurrency(b.pred)}`;

  // Set active tab
  document.getElementById('btnAccountTabMonth').classList.toggle('active', activeAccountDetailFilter === 'month');
  document.getElementById('btnAccountTabAll').classList.toggle('active', activeAccountDetailFilter === 'all');

  renderAccountTransactionsList();
  openModal(modal);
}

function renderAccountTransactionsList() {
  const acc = store.accountById(activeAccountDetailId);
  if (!acc) return;

  const txList = document.getElementById('accountTxList');
  const summaryBanner = document.getElementById('accountTxSummary');

  let txs = [];
  if (activeAccountDetailFilter === 'month') {
    const monthData = store.getAccountMonthData(activeAccountDetailId, store.activeMonth);
    txs = monthData.transactions;

    summaryBanner.style.display = 'flex';
    summaryBanner.innerHTML = `
      <span>${formatMonthBR(store.activeMonth)}: <strong>${monthData.count} lançamentos</strong></span>
      <span>Rec: <strong class="text-positive">${formatCurrency(monthData.totalIncome)}</strong> · Desp: <strong class="text-negative">${formatCurrency(monthData.totalExpense)}</strong></span>
    `;
  } else {
    txs = store.getRecentTransactions(activeAccountDetailId, 100, todayISO());
    summaryBanner.style.display = 'none';
  }

  if (txs.length === 0) {
    txList.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-muted);">Nenhum lançamento encontrado neste período.</div>`;
    return;
  }

  // Group by date
  let lastDate = '';
  let html = '';
  for (const t of txs) {
    if (t.date !== lastDate) {
      lastDate = t.date;
      html += `<div class="tx-day-header">${formatDateBR(t.date)}</div>`;
    }

    const isNegative = t.amt < 0;
    html += `
      <div class="tx-clickable-row" data-tx-id="${t.id}" style="display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid var(--border-glass);">
        <div>
          <div style="font-weight:600;font-size:0.92rem;">${t.payee}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">${t.cat || 'Sem categoria'} ${t.memo ? `· ${t.memo}` : ''}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:700;font-size:0.95rem;" class="${isNegative ? 'text-negative' : 'text-positive'}">
            ${formatCurrency(t.amt)}
          </div>
          <div style="font-size:0.7rem;color:var(--text-muted);">${t.rec ? '✓ Conciliado' : 'Pendente'}</div>
        </div>
      </div>
    `;
  }
  txList.innerHTML = html;

  // Attach click to account detail rows
  txList.querySelectorAll('.tx-clickable-row').forEach(row => {
    row.addEventListener('click', () => {
      const txId = row.getAttribute('data-tx-id');
      openTransactionActionsModal(txId);
    });
  });
}

// Open Transaction Actions Modal (Editar, Copiar, Excluir)
function openTransactionActionsModal(txId) {
  const t = store.transactionById(txId);
  if (!t) return;
  selectedActionTxId = txId;

  const modal = document.getElementById('modalTxActions');
  const payeeEl = document.getElementById('actionTxPayee');
  const subtitleEl = document.getElementById('actionTxSubtitle');
  const amountEl = document.getElementById('actionTxAmount');
  const statusEl = document.getElementById('actionTxStatus');

  const acc = store.accountById(t.acc);
  payeeEl.textContent = t.payee;
  subtitleEl.textContent = `${formatDateBR(t.date)} · ${acc?.name || ''} · ${t.cat || 'Sem categoria'}`;
  
  const isNeg = t.amt < 0;
  amountEl.textContent = formatCurrency(t.amt);
  amountEl.className = isNeg ? 'text-negative' : 'text-positive';

  statusEl.textContent = t.rec ? '✓ Lançamento Conciliado (Efetivado)' : '○ Lançamento Pendente / Previsto';

  openModal(modal);
}

// Open New Transaction Modal (Create Mode)
function openNewTransactionModal() {
  document.getElementById('txEditId').value = '';
  document.getElementById('txModalTitle').textContent = 'Novo Lançamento';
  document.getElementById('btnSaveTx').textContent = 'Salvar Lançamento';
  prepareTransactionForm();
}

// Open Edit Transaction Modal (Pre-populate with existing)
function openEditTransactionModal(txId) {
  const t = store.transactionById(txId);
  if (!t) return;

  document.getElementById('txEditId').value = txId;
  document.getElementById('txModalTitle').textContent = 'Editar Lançamento';
  document.getElementById('btnSaveTx').textContent = 'Atualizar Lançamento';

  prepareTransactionForm(t);
}

// Open Copy Transaction Modal (Duplicate with today's date)
function openCopyTransactionModal(txId) {
  const t = store.transactionById(txId);
  if (!t) return;

  document.getElementById('txEditId').value = '';
  document.getElementById('txModalTitle').textContent = 'Novo Lançamento (Cópia)';
  document.getElementById('btnSaveTx').textContent = 'Salvar Lançamento';

  // Clone with date = today
  const cloned = { ...t, date: todayISO(), rec: true };
  prepareTransactionForm(cloned);
}

function prepareTransactionForm(preset = null) {
  const modal = document.getElementById('modalNewTx');
  const accSelect = document.getElementById('txAccSelect');
  const peerSelect = document.getElementById('txPeerSelect');
  const catSelect = document.getElementById('txCatSelect');
  const dateInput = document.getElementById('txDate');
  const payeeInput = document.getElementById('txPayee');
  const amtInput = document.getElementById('txAmount');
  const memoInput = document.getElementById('txMemo');
  const chipsContainer = document.getElementById('payeeChipsContainer');
  const recCheckbox = document.getElementById('txRecCheckbox');
  const dropdown = document.getElementById('payeeDropdown');

  dropdown.classList.remove('show');

  // Fill accounts
  const accs = store.activeAccounts;
  let accOptions = '';
  for (const a of accs) {
    accOptions += `<option value="${a.id}">${a.name} (${a.type})</option>`;
  }
  accSelect.innerHTML = accOptions;
  peerSelect.innerHTML = accOptions;

  if (preset) {
    const isXfer = Boolean(preset.peer || preset.xfer);
    const absCents = Math.abs(preset.amt);
    const reals = Math.floor(absCents / 100);
    const cents = absCents % 100;

    amtInput.value = `${reals.toLocaleString('pt-BR')},${cents.toString().padStart(2, '0')}`;
    payeeInput.value = preset.payee.replace(/\s\(\d+\/\d+\)$/, '').trim();
    accSelect.value = preset.acc;
    dateInput.value = preset.date;
    memoInput.value = preset.memo || '';
    recCheckbox.checked = Boolean(preset.rec);

    document.getElementById('txMode').value = 'single';
    document.getElementById('txInstallmentsGroup').style.display = 'none';

    if (isXfer) {
      setTransactionType('transferencia');
      if (preset.peer) peerSelect.value = preset.peer;
    } else {
      setTransactionType(preset.amt < 0 ? 'despesa' : 'receita');
      if (preset.cat) catSelect.value = preset.cat;
    }
  } else {
    // New Defaults
    dateInput.value = todayISO();
    amtInput.value = '';
    payeeInput.value = '';
    memoInput.value = '';
    document.getElementById('txMode').value = 'single';
    document.getElementById('txInstallmentsGroup').style.display = 'none';
    document.getElementById('txInstallments').value = '2';
    recCheckbox.checked = true;

    setTransactionType('despesa');
  }

  // Frequent Payees chips
  const frequent = store.getFrequentPayees();
  if (frequent.length > 0 && !preset) {
    let chipsHtml = '';
    for (const item of frequent.slice(0, 10)) {
      chipsHtml += `<div class="chip" data-payee="${item.payee}" data-cat="${item.cat}" data-type="${item.isExpense ? 'despesa' : 'receita'}">${item.payee}</div>`;
    }
    chipsContainer.innerHTML = chipsHtml;
    chipsContainer.style.display = 'flex';

    chipsContainer.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        applyPayeeSelection(
          chip.getAttribute('data-payee'),
          chip.getAttribute('data-cat'),
          chip.getAttribute('data-type')
        );
      });
    });
  } else {
    chipsContainer.style.display = 'none';
  }

  openModal(modal);
  setTimeout(() => amtInput.focus(), 300);
}

// Apply selected payee autocomplete or chip
function applyPayeeSelection(payeeName, catName, type) {
  const payeeInput = document.getElementById('txPayee');
  const catSelect = document.getElementById('txCatSelect');
  const dropdown = document.getElementById('payeeDropdown');

  payeeInput.value = payeeName;
  if (type) setTransactionType(type);
  if (catName) catSelect.value = catName;
  dropdown.classList.remove('show');
}

// Switch transaction type in modal
function setTransactionType(type) {
  currentTxType = type;
  document.querySelectorAll('.segmented-btn').forEach(b => {
    b.classList.remove('active', 'despesa', 'receita', 'transferencia');
    if (b.getAttribute('data-type') === type) {
      b.classList.add('active', type);
    }
  });

  const catGroup = document.getElementById('txCatGroup');
  const peerGroup = document.getElementById('txPeerGroup');
  const catSelect = document.getElementById('txCatSelect');
  const amtInput = document.getElementById('txAmount');

  if (type === 'transferencia') {
    peerGroup.style.display = 'block';
    catGroup.style.display = 'none';
    amtInput.style.color = 'var(--om-blue)';
  } else {
    peerGroup.style.display = 'none';
    catGroup.style.display = 'block';
    amtInput.style.color = type === 'despesa' ? 'var(--om-red)' : 'var(--om-green)';

    // Update categories dropdown based on type
    const catType = type === 'despesa' ? 'Despesa' : 'Receita';
    const paths = store.getAllCategoryPaths(catType);
    let opts = '<option value="">(Sem categoria)</option>';
    for (const p of paths) {
      opts += `<option value="${p}">${p}</option>`;
    }
    catSelect.innerHTML = opts;
  }
}

// Submit new or edited transaction
async function submitNewTransaction() {
  const amtRaw = document.getElementById('txAmount').value;
  const cents = parseCurrencyToCents(amtRaw);
  if (cents <= 0) {
    alert('Informe um valor monetário válido maior que zero.');
    return;
  }

  const editId = document.getElementById('txEditId').value;
  const accId = document.getElementById('txAccSelect').value;
  const date = document.getElementById('txDate').value || todayISO();
  const payee = document.getElementById('txPayee').value.trim();
  const memo = document.getElementById('txMemo').value.trim();
  const mode = document.getElementById('txMode').value;
  const installments = parseInt(document.getElementById('txInstallments').value, 10) || 1;
  const isReconciled = document.getElementById('txRecCheckbox').checked;

  if (currentTxType !== 'transferencia' && !payee) {
    alert('Informe o favorecido / estabelecimento.');
    return;
  }

  let peerId = null;
  let catSelection = '';

  if (currentTxType === 'transferencia') {
    peerId = document.getElementById('txPeerSelect').value;
    if (peerId === accId) {
      alert('A conta de destino não pode ser a mesma de origem.');
      return;
    }
  } else {
    catSelection = document.getElementById('txCatSelect').value;
  }

  const signedAmt = currentTxType === 'despesa' ? -cents : cents;

  try {
    if (editId) {
      // Edit existing transaction
      store.updateTransaction(editId, {
        accId,
        date,
        payee: payee || 'Transferência',
        catSelection,
        memo,
        signedAmt,
        manualRec: isReconciled,
        peerId
      });
      showToast('✓ Lançamento atualizado com sucesso!');
    } else {
      // Create new transaction
      store.addTransaction({
        accId,
        date,
        payee: payee || 'Transferência',
        catSelection,
        memo,
        signedAmt,
        mode,
        installments,
        peerId,
        manualRec: isReconciled
      });
      showToast('✓ Lançamento incluído com sucesso!');
    }

    // Save to local IndexedDB
    await dbManager.saveDatabase(activeDbName, store.db);

    closeAllModals();
    renderDashboard();
    if (activeAccountDetailId) {
      renderAccountTransactionsList();
    }
  } catch (err) {
    alert(`Erro ao processar: ${err.message}`);
  }
}

// Setup common DOM event listeners
function setupEventListeners() {
  // Close modal on overlay tap (outside sheet)
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAllModals();
      }
    });
    // Prevent iOS background touchmove propagation
    modal.addEventListener('touchmove', (e) => {
      if (e.target === modal) {
        e.preventDefault();
      }
    }, { passive: false });
  });

  document.querySelectorAll('.sheet-close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Action Sheet Buttons (Editar, Copiar, Excluir)
  const btnEdit = document.getElementById('btnActionEditTx');
  if (btnEdit) {
    btnEdit.addEventListener('click', () => {
      if (!selectedActionTxId) return;
      const txId = selectedActionTxId;
      closeAllModals();
      openEditTransactionModal(txId);
    });
  }

  const btnCopy = document.getElementById('btnActionCopyTx');
  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      if (!selectedActionTxId) return;
      const txId = selectedActionTxId;
      closeAllModals();
      openCopyTransactionModal(txId);
    });
  }

  const btnDelete = document.getElementById('btnActionDeleteTx');
  if (btnDelete) {
    btnDelete.addEventListener('click', async () => {
      if (!selectedActionTxId) return;
      const t = store.transactionById(selectedActionTxId);
      if (!t) return;

      if (confirm(`Deseja realmente excluir o lançamento "${t.payee}" (${formatCurrency(t.amt)})?`)) {
        store.deleteTransaction(selectedActionTxId);
        await dbManager.saveDatabase(activeDbName, store.db);
        closeAllModals();
        renderDashboard();
        if (activeAccountDetailId) {
          renderAccountTransactionsList();
        }
        showToast('✓ Lançamento excluído com sucesso!');
      }
    });
  }

  // Account details tab filters
  const tabMonth = document.getElementById('btnAccountTabMonth');
  const tabAll = document.getElementById('btnAccountTabAll');
  if (tabMonth && tabAll) {
    tabMonth.addEventListener('click', () => {
      activeAccountDetailFilter = 'month';
      tabMonth.classList.add('active');
      tabAll.classList.remove('active');
      renderAccountTransactionsList();
    });
    tabAll.addEventListener('click', () => {
      activeAccountDetailFilter = 'all';
      tabAll.classList.add('active');
      tabMonth.classList.remove('active');
      renderAccountTransactionsList();
    });
  }

  // New Tx Type Switcher
  document.querySelectorAll('.segmented-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setTransactionType(btn.getAttribute('data-type'));
    });
  });

  // Payee Live Autocomplete (as user types)
  const payeeInput = document.getElementById('txPayee');
  const payeeDropdown = document.getElementById('payeeDropdown');
  if (payeeInput && payeeDropdown) {
    payeeInput.addEventListener('input', () => {
      const q = payeeInput.value.trim();
      if (q.length < 2) {
        payeeDropdown.classList.remove('show');
        return;
      }
      const matches = store.searchPayees(q);
      if (matches.length === 0) {
        payeeDropdown.classList.remove('show');
        return;
      }

      let html = '';
      for (const m of matches) {
        html += `
          <div class="autocomplete-item" data-payee="${m.payee}" data-cat="${m.cat}" data-type="${m.isExpense ? 'despesa' : 'receita'}">
            <span class="name">${m.payee}</span>
            <span class="cat-badge">${m.cat || 'Geral'}</span>
          </div>
        `;
      }
      payeeDropdown.innerHTML = html;
      payeeDropdown.classList.add('show');

      payeeDropdown.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
          applyPayeeSelection(
            item.getAttribute('data-payee'),
            item.getAttribute('data-cat'),
            item.getAttribute('data-type')
          );
        });
      });
    });

    // Close autocomplete when clicking outside
    document.addEventListener('click', (e) => {
      if (!payeeInput.contains(e.target) && !payeeDropdown.contains(e.target)) {
        payeeDropdown.classList.remove('show');
      }
    });
  }

  // Date change -> automatically update reconciled checkbox suggestion
  const dateInput = document.getElementById('txDate');
  const recCheckbox = document.getElementById('txRecCheckbox');
  if (dateInput && recCheckbox) {
    dateInput.addEventListener('change', () => {
      recCheckbox.checked = dateInput.value <= todayISO();
    });
  }

  // Installment toggle
  const modeSelect = document.getElementById('txMode');
  if (modeSelect) {
    modeSelect.addEventListener('change', () => {
      const isInst = modeSelect.value === 'installment';
      document.getElementById('txInstallmentsGroup').style.display = isInst ? 'block' : 'none';
    });
  }

  // Amount auto-formatting on blur
  const amtInput = document.getElementById('txAmount');
  if (amtInput) {
    amtInput.addEventListener('blur', () => {
      const val = amtInput.value.trim();
      if (val) {
        const cents = parseCurrencyToCents(val);
        if (cents > 0) {
          const reals = Math.floor(cents / 100);
          const remainder = cents % 100;
          amtInput.value = `${reals.toLocaleString('pt-BR')},${remainder.toString().padStart(2, '0')}`;
        }
      }
    });
  }

  // Submit button
  const btnSaveTx = document.getElementById('btnSaveTx');
  if (btnSaveTx) {
    btnSaveTx.addEventListener('click', submitNewTransaction);
  }

  // Add another DB button in switcher
  const btnAddNewDb = document.getElementById('btnAddNewDb');
  const fileInputSwitcher = document.getElementById('fileInputSwitcher');
  if (btnAddNewDb && fileInputSwitcher) {
    btnAddNewDb.addEventListener('click', () => fileInputSwitcher.click());
    fileInputSwitcher.addEventListener('change', handleFileInput);
  }
}

// Start app on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
