// OpenMoney Coletor - Mobile Application Controller
import { coletorStorage } from './db.js';
import { receiptScanner } from './ocr.js';
import { formatCurrency, parseCurrencyToCents, todayISO, formatDateBR, uid, SEP } from './models.js';

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      reg.update().catch(() => {});
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showToast('🔄 Coletor atualizado! Recarregando...');
              setTimeout(() => window.location.reload(), 1500);
            }
          });
        }
      });
    }).catch(err => console.warn('SW registration failed:', err));
  });
}

// Toast Notification Helper
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// Modal open/close helpers
function openModal(modal) {
  if (!modal) return;
  document.body.classList.add('modal-open');
  modal.classList.add('active');
}

function closeAllModals() {
  document.body.classList.remove('modal-open');
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

// App Initialization
function initApp() {
  setupEventListeners();
  renderApp();

  const structure = coletorStorage.getStructure();
  if (!structure) {
    // Open setup modal on first run
    openSetupModal();
  }
}

// Main Render Routine
function renderApp() {
  const structure = coletorStorage.getStructure();
  const pending = coletorStorage.getPendingTransactions();

  // 1. Header Info
  const headerBaseName = document.getElementById('headerBaseName');
  if (headerBaseName) {
    headerBaseName.textContent = structure ? structure.baseName : 'Vincular Base';
  }

  // 2. Accounts Scroll
  const accountsContainer = document.getElementById('accountsScrollContainer');
  if (accountsContainer) {
    if (!structure || !structure.accounts || structure.accounts.length === 0) {
      accountsContainer.innerHTML = `
        <div style="font-size:0.8rem;color:var(--text-muted);padding:6px 0;">
          Toque em <strong>Vincular Base</strong> para carregar suas contas e saldos.
        </div>
      `;
    } else {
      // Calculate pending expenses for each account
      const pendingByAcc = {};
      for (const t of pending) {
        pendingByAcc[t.acc] = (pendingByAcc[t.acc] || 0) + t.amt;
      }

      let accHtml = '';
      const activeAccs = structure.accounts.filter(a => !a.inactive);
      for (const a of activeAccs) {
        const liveBalance = a.balance + (pendingByAcc[a.id] || 0);
        const isNeg = liveBalance < 0;
        accHtml += `
          <div class="acc-mini-card">
            <div class="acc-mini-name">${a.favorite ? '★ ' : ''}${a.name}</div>
            <div class="acc-mini-balance ${isNeg ? 'text-negative' : 'text-positive'}">
              ${formatCurrency(liveBalance)}
            </div>
          </div>
        `;
      }
      accountsContainer.innerHTML = accHtml;
    }
  }

  // 3. Pending Transactions Queue
  const pendingContainer = document.getElementById('pendingListContainer');
  const badgePendingCount = document.getElementById('badgePendingCount');
  const exportCard = document.getElementById('exportCardContainer');

  if (badgePendingCount) {
    badgePendingCount.textContent = pending.length;
  }

  if (pendingContainer) {
    if (pending.length === 0) {
      pendingContainer.innerHTML = `
        <div style="background:var(--bg-card);border:1px solid var(--border-glass);border-radius:var(--radius-md);padding:24px 16px;text-align:center;color:var(--text-muted);font-size:0.88rem;">
          <div style="font-size:1.8rem;margin-bottom:8px;">📥</div>
          Nenhum lançamento pendente na fila.<br>
          Use <strong>Escanear</strong> ou <strong>Novo Lançamento</strong> para registrar gastos na rua.
        </div>
      `;
      if (exportCard) exportCard.style.display = 'none';
    } else {
      let html = '';
      let totalPending = 0;

      for (const t of pending) {
        totalPending += t.amt;
        const isNeg = t.amt < 0;
        const acc = structure?.accounts?.find(a => a.id === t.acc);

        html += `
          <div class="pending-card">
            <div class="pending-info">
              ${t.receiptThumb ? `<img src="${t.receiptThumb}" class="pending-thumb" alt="Recibo">` : '<div style="font-size:1.4rem;">🧾</div>'}
              <div class="pending-details">
                <div class="name">${t.payee}</div>
                <div class="sub">${formatDateBR(t.date)} · ${acc?.name || 'Conta'} · ${t.cat || 'Geral'}</div>
              </div>
            </div>
            <div class="pending-balances">
              <div class="pending-amount ${isNeg ? 'text-negative' : 'text-positive'}">
                ${formatCurrency(t.amt)}
              </div>
              <button class="btn-delete-pending" data-id="${t.id}" title="Excluir da fila">&times;</button>
            </div>
          </div>
        `;
      }

      pendingContainer.innerHTML = html;

      // Attach delete click
      pendingContainer.querySelectorAll('.btn-delete-pending').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          if (confirm('Remover este lançamento da fila de envio?')) {
            coletorStorage.deletePendingTransaction(id);
            renderApp();
            showToast('Lançamento removido.');
          }
        });
      });

      if (exportCard) {
        exportCard.style.display = 'block';
      }
    }
  }
}

// Open Setup Modal
function openSetupModal() {
  const structure = coletorStorage.getStructure();
  const infoEl = document.getElementById('setupCurrentBaseInfo');
  if (infoEl) {
    if (structure) {
      infoEl.innerHTML = `
        <strong>${structure.baseName}</strong> (${structure.accounts?.length || 0} contas, ${structure.cats?.length || 0} categorias)<br>
        <span style="font-size:0.72rem;">Última leitura: ${new Date(structure.updatedAt).toLocaleString('pt-BR')}</span>
      `;
    } else {
      infoEl.textContent = 'Nenhuma base vinculada ainda.';
    }
  }
  openModal(document.getElementById('modalSetup'));
}

// Open Form Modal (New or Edit)
function openTransactionForm(preset = null) {
  const structure = coletorStorage.getStructure();
  if (!structure) {
    openSetupModal();
    return;
  }

  const modal = document.getElementById('modalTxForm');
  const title = document.getElementById('txModalTitle');
  const txIdInput = document.getElementById('formTxId');
  const thumbInput = document.getElementById('formReceiptThumb');
  const previewWrap = document.getElementById('receiptPreviewWrap');
  const previewImg = document.getElementById('receiptPreviewImg');

  const amtInput = document.getElementById('formAmount');
  const payeeInput = document.getElementById('formPayee');
  const accSelect = document.getElementById('formAccount');
  const catSelect = document.getElementById('formCategory');
  const dateInput = document.getElementById('formDate');
  const memoInput = document.getElementById('formMemo');

  // Fill accounts dropdown
  let accOpts = '';
  for (const a of structure.accounts.filter(acc => !acc.inactive)) {
    accOpts += `<option value="${a.id}">${a.name} (${a.type})</option>`;
  }
  accSelect.innerHTML = accOpts;

  // Fill categories dropdown
  let catOpts = '<option value="">(Sem categoria)</option>';
  const parents = structure.cats.filter(c => !c.parent || c.parent.trim() === '');
  for (const p of parents) {
    const subs = structure.cats.filter(c => c.parent === p.name);
    if (subs.length === 0) {
      catOpts += `<option value="${p.name}">${p.name}</option>`;
    } else {
      for (const s of subs) {
        const full = `${p.name}${SEP}${s.name}`;
        catOpts += `<option value="${full}">${full}</option>`;
      }
    }
  }
  catSelect.innerHTML = catOpts;

  if (preset) {
    title.textContent = preset.isScan ? 'Confirmar Dados do Recibo' : 'Novo Lançamento';
    txIdInput.value = preset.id || '';
    thumbInput.value = preset.thumbnail || '';

    if (preset.thumbnail) {
      previewImg.src = preset.thumbnail;
      previewWrap.style.display = 'flex';
    } else {
      previewWrap.style.display = 'none';
    }

    if (preset.amt) {
      const absCents = Math.abs(preset.amt);
      const reals = Math.floor(absCents / 100);
      const cents = absCents % 100;
      amtInput.value = `${reals.toLocaleString('pt-BR')},${cents.toString().padStart(2, '0')}`;
    } else {
      amtInput.value = '';
    }

    payeeInput.value = preset.payee || '';
    dateInput.value = preset.date || todayISO();
    memoInput.value = preset.memo || '';

    // Auto-match category based on payee
    if (preset.payee && structure.frequentPayees) {
      const match = structure.frequentPayees.find(p => p.payee.toLowerCase().includes(preset.payee.toLowerCase()));
      if (match && match.cat) {
        catSelect.value = match.cat;
      }
    }
  } else {
    title.textContent = 'Novo Lançamento';
    txIdInput.value = '';
    thumbInput.value = '';
    previewWrap.style.display = 'none';

    amtInput.value = '';
    payeeInput.value = '';
    dateInput.value = todayISO();
    memoInput.value = '';
  }

  openModal(modal);
  setTimeout(() => amtInput.focus(), 300);
}

// Handle Camera / Receipt Image Selection
async function handleReceiptImageSelected(e) {
  const file = e.target.files[0];
  if (!file) return;

  const loadingModal = document.getElementById('modalOcrLoading');
  const statusEl = document.getElementById('ocrProgressStatus');

  openModal(loadingModal);

  try {
    const parsed = await receiptScanner.scanReceipt(file, (msg) => {
      if (statusEl) statusEl.textContent = msg;
    });

    closeAllModals();

    openTransactionForm({
      isScan: true,
      payee: parsed.payee,
      amt: parsed.amt,
      date: parsed.date,
      thumbnail: parsed.thumbnail,
      memo: 'Comprovante escaneado via OCR'
    });

    showToast('✓ Comprovante reconhecido com sucesso!');
  } catch (err) {
    closeAllModals();
    alert(`Não foi possível ler o comprovante: ${err.message}`);
  } finally {
    e.target.value = ''; // reset input
  }
}

// Handle OpenMoney Structure JSON file selection
async function handleStructureFileSelected(e) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const fullDb = JSON.parse(text);
    coletorStorage.importFromFullDB(fullDb, file.name);

    closeAllModals();
    renderApp();
    showToast(`✓ Base ${file.name} vinculada com sucesso!`);
  } catch (err) {
    alert(`Erro ao ler base: ${err.message}`);
  } finally {
    e.target.value = '';
  }
}

// Save Transaction into Pending Queue
function submitTransactionForm() {
  const amtRaw = document.getElementById('formAmount').value;
  const cents = parseCurrencyToCents(amtRaw);
  if (cents <= 0) {
    alert('Informe um valor monetário válido maior que zero.');
    return;
  }

  const payee = document.getElementById('formPayee').value.trim();
  if (!payee) {
    alert('Informe o nome do estabelecimento ou favorecido.');
    return;
  }

  const accId = document.getElementById('formAccount').value;
  const cat = document.getElementById('formCategory').value;
  const date = document.getElementById('formDate').value || todayISO();
  const memo = document.getElementById('formMemo').value.trim();
  const thumb = document.getElementById('formReceiptThumb').value;

  const newTx = {
    id: uid(),
    acc: accId,
    date: date,
    payee: payee,
    cat: cat,
    memo: memo,
    amt: -cents, // Default to expense
    rec: true,
    createdAt: new Date().toISOString(),
    receiptThumb: thumb || null
  };

  coletorStorage.addPendingTransaction(newTx);

  closeAllModals();
  renderApp();
  showToast('✓ Lançamento adicionado à fila para o Mac!');
}

// Export Pending Queue to Mac (openmoney_inbox.json)
async function exportPendingToMac() {
  try {
    const res = await coletorStorage.exportPendingToMac();
    if (res.success) {
      setTimeout(() => {
        if (confirm(`Arquivo openmoney_inbox.json gerado (${res.count} lançamentos)!\n\nDeseja limpar a fila de novos lançamentos agora?`)) {
          coletorStorage.clearPendingTransactions();
          renderApp();
          showToast('✓ Fila de envio limpa com sucesso!');
        }
      }, 600);
    }
  } catch (err) {
    alert(`Erro ao exportar: ${err.message}`);
  }
}

// Event Listeners Setup
function setupEventListeners() {
  // Modal overlay tap to close
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAllModals();
    });
    modal.addEventListener('touchmove', (e) => {
      if (e.target === modal) e.preventDefault();
    }, { passive: false });
  });

  document.querySelectorAll('.sheet-close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Header Setup Button
  const btnHeaderSetup = document.getElementById('btnHeaderSetup');
  if (btnHeaderSetup) {
    btnHeaderSetup.addEventListener('click', openSetupModal);
  }

  // Choose structure file
  const btnChooseStructureFile = document.getElementById('btnChooseStructureFile');
  const fileStructureInput = document.getElementById('fileStructureInput');
  if (btnChooseStructureFile && fileStructureInput) {
    btnChooseStructureFile.addEventListener('click', () => fileStructureInput.click());
    fileStructureInput.addEventListener('change', handleStructureFileSelected);
  }

  // Action: Scan Receipt
  const btnScanReceipt = document.getElementById('btnScanReceipt');
  const fileCameraInput = document.getElementById('fileCameraInput');
  if (btnScanReceipt && fileCameraInput) {
    btnScanReceipt.addEventListener('click', () => fileCameraInput.click());
    fileCameraInput.addEventListener('change', handleReceiptImageSelected);
  }

  // Action: Manual Transaction
  const btnManualTx = document.getElementById('btnManualTx');
  if (btnManualTx) {
    btnManualTx.addEventListener('click', () => openTransactionForm());
  }

  // Save to Queue
  const btnSaveToQueue = document.getElementById('btnSaveToQueue');
  if (btnSaveToQueue) {
    btnSaveToQueue.addEventListener('click', submitTransactionForm);
  }

  // Export to Mac
  const btnExportToMac = document.getElementById('btnExportToMac');
  if (btnExportToMac) {
    btnExportToMac.addEventListener('click', exportPendingToMac);
  }
}

document.addEventListener('DOMContentLoaded', initApp);
