// OpenMoney Business Logic & In-Memory Store
import { uid, invKeyFor, invDates, isVigenteInvoice, addMonths, todayISO, CARD_TYPE, SEP, normalizeStr } from './models.js';

export class MoneyStore {
  constructor() {
    this.db = null;
    this.activeMonth = todayISO().substring(0, 7); // "YYYY-MM"
    this.payeeMap = new Map();
    this.listeners = [];
  }

  subscribe(fn) {
    this.listeners.push(fn);
  }

  notify() {
    for (const fn of this.listeners) {
      fn(this);
    }
  }

  setDatabase(dbData) {
    this.db = dbData;
    if (!this.db.accounts) this.db.accounts = [];
    if (!this.db.txs) this.db.txs = [];
    if (!this.db.cats) this.db.cats = [];
    if (!this.db.recs) this.db.recs = [];
    if (!this.db.budgets) this.db.budgets = {};
    this.rebuildPayeeMap();
    this.notify();
  }

  rebuildPayeeMap() {
    this.payeeMap.clear();
    const txs = this.db?.txs || [];
    for (const tx of txs) {
      if (tx.auto || tx.xfer || !tx.payee) continue;
      const clean = tx.payee.replace(/\s\(\d+\/\d+\)$/, '').trim();
      if (!clean) continue;
      const normKey = normalizeStr(clean);
      if (!this.payeeMap.has(normKey)) {
        this.payeeMap.set(normKey, {
          payee: clean,
          cat: tx.cat || '',
          isExpense: tx.amt < 0,
          count: 1,
          lastDate: tx.date
        });
      } else {
        const item = this.payeeMap.get(normKey);
        item.count += 1;
        if (tx.date > item.lastDate) {
          item.lastDate = tx.date;
          item.cat = tx.cat || item.cat;
          item.isExpense = tx.amt < 0;
        }
      }
    }
  }

  // Live Autocomplete for Payee (as user types)
  searchPayees(query) {
    if (!query) return [];
    const normQ = normalizeStr(query);
    if (!normQ) return [];

    const matches = [];
    for (const [normKey, item] of this.payeeMap.entries()) {
      if (normKey.includes(normQ)) {
        matches.push(item);
      }
    }
    // Sort by count descending, then by lastDate descending
    matches.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.lastDate.localeCompare(a.lastDate);
    });
    return matches.slice(0, 8);
  }

  get activeAccounts() {
    if (!this.db || !this.db.accounts) return [];
    return this.db.accounts.filter(a => !a.inactive);
  }

  get favoriteAccounts() {
    if (!this.db || !this.db.accounts) return [];
    return this.db.accounts.filter(a => a.favorite && !a.inactive);
  }

  get standardActiveAccounts() {
    if (!this.db || !this.db.accounts) return [];
    return this.db.accounts.filter(a => !a.favorite && !a.inactive);
  }

  get inactiveAccounts() {
    if (!this.db || !this.db.accounts) return [];
    return this.db.accounts.filter(a => a.inactive);
  }

  groupAccountsByType(list) {
    const map = {
      "Corrente": [],
      "Poupança": [],
      "Cartão de crédito": [],
      "Investimento": [],
      "Dinheiro": []
    };
    for (const a of list) {
      const type = a.type || "Corrente";
      if (!map[type]) map[type] = [];
      map[type].push(a);
    }
    return map;
  }

  get accountsByType() {
    return this.groupAccountsByType(this.activeAccounts);
  }

  accountById(id) {
    return this.db?.accounts?.find(a => a.id === id) || null;
  }

  transactionById(id) {
    return this.db?.txs?.find(t => t.id === id) || null;
  }

  // Calculate balances for an account (Real and Predicted)
  calculateAccountBalance(acc) {
    if (!acc) return { real: 0, pred: 0 };
    const opening = acc.opening || 0;
    let realSum = opening;
    let predSum = opening;
    const endOfMonth = `${this.activeMonth}-31`;

    const txs = this.db?.txs || [];
    for (const tx of txs) {
      if (tx.acc === acc.id) {
        if (tx.rec) {
          realSum += tx.amt;
        }
        if (tx.rec || tx.date <= endOfMonth) {
          predSum += tx.amt;
        }
      }
    }

    return { real: realSum, pred: predSum };
  }

  // Total Net Worth (consolidated balance across active accounts)
  calculateTotalNetWorth() {
    let totalReal = 0;
    let totalPred = 0;
    for (const acc of this.activeAccounts) {
      const b = this.calculateAccountBalance(acc);
      totalReal += b.real;
      totalPred += b.pred;
    }
    return { real: totalReal, pred: totalPred };
  }

  // Month transactions for a specific account (with opening balance and totals)
  getAccountMonthData(accId, monthYM = null) {
    const ym = monthYM || this.activeMonth;
    const acc = this.accountById(accId);
    if (!acc) return { transactions: [], totalIncome: 0, totalExpense: 0, count: 0, month: ym };

    const monthStart = `${ym}-01`;
    const monthEnd = `${ym}-31`;
    const accTxs = (this.db?.txs || []).filter(t => t.acc === accId);

    const monthTxs = [];
    let income = 0;
    let expense = 0;

    for (const t of accTxs) {
      if (t.date >= monthStart && t.date <= monthEnd) {
        monthTxs.push(t);
        if (t.amt > 0) income += t.amt;
        else expense += t.amt;
      }
    }

    // Sort descending by date, then id
    monthTxs.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return (b.id || '').localeCompare(a.id || '');
    });

    return {
      month: ym,
      transactions: monthTxs,
      totalIncome: income,
      totalExpense: expense,
      count: monthTxs.length
    };
  }

  // Get transactions for today (strictly date === todayISO())
  getTodayTransactions() {
    if (!this.db || !this.db.txs) return { transactions: [], totalIncome: 0, totalExpense: 0 };
    const today = todayISO();
    const todayTxs = this.db.txs.filter(t => t.date === today);

    let income = 0;
    let expense = 0;
    for (const t of todayTxs) {
      if (t.amt > 0) income += t.amt;
      else expense += t.amt;
    }

    // Sort descending by id or insertion order
    todayTxs.sort((a, b) => (b.id || '').localeCompare(a.id || ''));

    return {
      transactions: todayTxs,
      totalIncome: income,
      totalExpense: expense,
      count: todayTxs.length
    };
  }

  // Get recent transactions (defaults to transactions up to today, excluding future projected items)
  getRecentTransactions(accId = null, limit = 15, maxDate = todayISO()) {
    if (!this.db || !this.db.txs) return [];
    let list = this.db.txs;
    if (maxDate) {
      list = list.filter(t => t.date <= maxDate);
    }
    if (accId) {
      list = list.filter(t => t.acc === accId);
    }
    return [...list].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return (b.id || '').localeCompare(a.id || '');
    }).slice(0, limit);
  }

  // Category hierarchy list
  getCategories(type = null) {
    if (!this.db || !this.db.cats) return [];
    let cats = this.db.cats;
    if (type) {
      cats = cats.filter(c => c.type === type);
    }
    return cats;
  }

  // List of formatted category path strings "Parent › Sub"
  getAllCategoryPaths(type = null) {
    const cats = this.getCategories(type);
    const paths = [];
    const parents = cats.filter(c => !c.parent || c.parent.trim() === '');
    
    for (const p of parents) {
      // Always include the main/parent category itself
      paths.push(p.name);
      const subs = cats.filter(c => c.parent === p.name);
      for (const s of subs) {
        paths.push(`${p.name}${SEP}${s.name}`);
      }
    }
    return paths.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  // Frequent payees for quick chips
  getFrequentPayees() {
    return Array.from(this.payeeMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  // Add Transaction following all OpenMoney rules
  addTransaction({
    accId,
    date,
    payee,
    catSelection,
    memo = '',
    signedAmt,
    mode = 'single', // 'single', 'installment'
    installments = 1,
    peerId = null,
    manualRec = undefined
  }) {
    if (!this.db) throw new Error('Base de dados não carregada.');
    const curAcc = this.accountById(accId);
    if (!curAcc) throw new Error('Conta selecionada inválida.');

    const isXfer = Boolean(peerId);
    const peerAcc = isXfer ? this.accountById(peerId) : null;
    const catLabel = isXfer ? `Transferência: ${peerAcc?.name || ''}` : catSelection;

    const isCard = curAcc.type === CARD_TYPE && Boolean(curAcc.card);
    const count = mode === 'installment' ? Math.max(2, Math.min(120, installments)) : 1;

    const baseCents = Math.abs(signedAmt);
    const unitAmt = Math.floor(baseCents / count);
    const remainder = baseCents - (unitAmt * count);
    const planId = count > 1 ? uid() : null;

    const createdTxs = [];
    const today = todayISO();

    for (let i = 0; i < count; i++) {
      const txDate = i === 0 ? date : addMonths(date, i);
      const suffix = count > 1 ? ` (${i + 1}/${count})` : '';
      const installmentPayee = `${payee.trim()}${suffix}`;
      const instCents = (i === 0 ? unitAmt + remainder : unitAmt);
      const finalAmt = isXfer ? -instCents : (signedAmt < 0 ? -instCents : instCents);

      const baseIk = isCard ? invKeyFor(curAcc.card, txDate) : null;
      const xferId = isXfer ? uid() : null;

      // In OpenMoney Swift rules: single transactions or installment 1 are reconciled if date <= today
      const isReconciled = manualRec !== undefined
        ? Boolean(manualRec)
        : (txDate <= today && i === 0);

      // Primary transaction (or transfer debit)
      const primaryTx = {
        id: uid(),
        acc: accId,
        peer: isXfer ? peerId : null,
        date: txDate,
        payee: installmentPayee,
        cat: catLabel,
        memo: memo.trim(),
        amt: finalAmt,
        rec: isReconciled,
        xfer: xferId,
        ik: baseIk,
        pn: count > 1 ? (i + 1) : null,
        pt: count > 1 ? count : null,
        plan: planId
      };

      createdTxs.push(primaryTx);

      // Mirror transaction for transfer
      if (isXfer && peerAcc) {
        const isPeerCard = peerAcc.type === CARD_TYPE && Boolean(peerAcc.card);
        const peerIk = isPeerCard ? invKeyFor(peerAcc.card, txDate) : null;

        const mirrorTx = {
          id: uid(),
          acc: peerId,
          peer: accId,
          date: txDate,
          payee: installmentPayee,
          cat: `Transferência: ${curAcc.name}`,
          memo: memo.trim(),
          amt: instCents, // Credit on destination
          rec: isReconciled,
          xfer: xferId,
          ik: peerIk,
          pn: count > 1 ? (i + 1) : null,
          pt: count > 1 ? count : null,
          plan: planId
        };
        createdTxs.push(mirrorTx);
      }
    }

    // Append to transactions
    this.db.txs.push(...createdTxs);
    this.rebuildPayeeMap();
    this.notify();
    return createdTxs;
  }

  // Delete transaction (and mirror transaction if transfer)
  deleteTransaction(txId) {
    if (!this.db || !this.db.txs) return false;
    const target = this.transactionById(txId);
    if (!target) return false;

    if (target.xfer) {
      this.db.txs = this.db.txs.filter(t => t.xfer !== target.xfer);
    } else {
      this.db.txs = this.db.txs.filter(t => t.id !== txId);
    }

    this.rebuildPayeeMap();
    this.notify();
    return true;
  }

  // Update existing transaction
  updateTransaction(txId, {
    accId,
    date,
    payee,
    catSelection,
    memo = '',
    signedAmt,
    manualRec = undefined,
    peerId = null
  }) {
    if (!this.db || !this.db.txs) return false;
    const idx = this.db.txs.findIndex(t => t.id === txId);
    if (idx < 0) return false;

    const t = this.db.txs[idx];
    const curAcc = this.accountById(accId);
    if (!curAcc) return false;

    const isCard = curAcc.type === CARD_TYPE && Boolean(curAcc.card);
    const newIk = isCard ? invKeyFor(curAcc.card, date) : null;
    const isXfer = Boolean(peerId || t.xfer);
    const targetPeerId = peerId || t.peer;
    const peerAcc = targetPeerId ? this.accountById(targetPeerId) : null;
    const catLabel = isXfer ? `Transferência: ${peerAcc?.name || ''}` : catSelection;

    t.acc = accId;
    t.date = date;
    t.payee = payee.trim();
    t.cat = catLabel;
    t.memo = memo.trim();
    t.amt = isXfer ? -Math.abs(signedAmt) : signedAmt;
    t.ik = newIk;
    if (manualRec !== undefined) {
      t.rec = Boolean(manualRec);
    }

    // Mirror leg if transfer
    if (t.xfer) {
      const mirrorIdx = this.db.txs.findIndex(o => o.xfer === t.xfer && o.id !== t.id);
      if (mirrorIdx >= 0) {
        const m = this.db.txs[mirrorIdx];
        m.date = date;
        m.payee = payee.trim();
        m.memo = memo.trim();
        m.amt = Math.abs(signedAmt);
        if (manualRec !== undefined) {
          m.rec = Boolean(manualRec);
        }
        if (targetPeerId) {
          m.acc = targetPeerId;
          m.peer = accId;
          m.cat = `Transferência: ${curAcc.name}`;
          if (peerAcc && peerAcc.type === CARD_TYPE && peerAcc.card) {
            m.ik = invKeyFor(peerAcc.card, date);
          } else {
            m.ik = null;
          }
        }
      }
    }

    this.rebuildPayeeMap();
    this.notify();
    return true;
  }

  getDueBills(days = 3) {
    if (!this.db || !this.db.txs) return [];
    const today = todayISO();
    const todayDate = new Date(today + 'T00:00:00');
    return this.db.txs.filter(tx => {
      if (tx.rec) return false;
      const acc = this.accById(tx.acc);
      const isCard = acc && acc.type === CARD_TYPE && Boolean(acc.card);
      let effectiveDueDate = tx.date;
      let isOverdue = false;

      if (isCard) {
        const ik = tx.ik || invKeyFor(acc.card, tx.date);
        const dates = invDates(acc.card, ik);
        const dueDate = (acc.invoices && acc.invoices[ik] && acc.invoices[ik].due) || dates.due;
        effectiveDueDate = dueDate;
        const isVigente = isVigenteInvoice(acc.card, ik, acc, today);
        const diff = Math.round((new Date(effectiveDueDate + 'T00:00:00') - todayDate) / (1000 * 60 * 60 * 24));
        isOverdue = diff < 0 && isVigente;
      } else {
        const diff = Math.round((new Date(tx.date + 'T00:00:00') - todayDate) / (1000 * 60 * 60 * 24));
        isOverdue = diff < 0;
      }

      const diffDays = Math.round((new Date(effectiveDueDate + 'T00:00:00') - todayDate) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        if (days < 9000 && !isOverdue) return false;
      } else {
        if (diffDays > days) return false;
      }
      return true;
    }).map(tx => {
      const acc = this.accById(tx.acc);
      const isCard = acc && acc.type === CARD_TYPE && Boolean(acc.card);
      let effectiveDueDate = tx.date;
      let isOverdue = false;

      if (isCard) {
        const ik = tx.ik || invKeyFor(acc.card, tx.date);
        const dates = invDates(acc.card, ik);
        const dueDate = (acc.invoices && acc.invoices[ik] && acc.invoices[ik].due) || dates.due;
        effectiveDueDate = dueDate;
        const isVigente = isVigenteInvoice(acc.card, ik, acc, today);
        const diff = Math.round((new Date(effectiveDueDate + 'T00:00:00') - todayDate) / (1000 * 60 * 60 * 24));
        isOverdue = diff < 0 && isVigente;
      } else {
        const diff = Math.round((new Date(tx.date + 'T00:00:00') - todayDate) / (1000 * 60 * 60 * 24));
        isOverdue = diff < 0;
      }

      const diffDays = Math.round((new Date(effectiveDueDate + 'T00:00:00') - todayDate) / (1000 * 60 * 60 * 24));

      return {
        tx,
        daysUntilDue: diffDays,
        isOverdue,
        isDueToday: diffDays === 0,
        effectiveDueDate,
        accountName: acc ? acc.name : 'Conta'
      };
    }).sort((a, b) => a.daysUntilDue - b.daysUntilDue || a.effectiveDueDate.localeCompare(b.effectiveDueDate) || a.tx.date.localeCompare(b.tx.date));
  }

  dueBillsSummary(days = 3) {
    const items = this.getDueBills(days);
    let payCount = 0, payTotal = 0, recCount = 0, recTotal = 0, overdueCount = 0, todayCount = 0;
    for (const item of items) {
      if (item.isOverdue) overdueCount++;
      if (item.isDueToday) todayCount++;
      if (item.tx.amt < 0) {
        payCount++;
        payTotal += Math.abs(item.tx.amt);
      } else {
        recCount++;
        recTotal += item.tx.amt;
      }
    }
    return {
      totalCount: items.length,
      payCount,
      payTotal,
      receiveCount: recCount,
      receiveTotal: recTotal,
      netTotal: recTotal - payTotal,
      overdueCount,
      todayCount
    };
  }
}

export const store = new MoneyStore();
