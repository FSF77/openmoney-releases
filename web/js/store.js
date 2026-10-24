// OpenMoney Business Logic & In-Memory Store
import { uid, invKeyFor, addMonths, CARD_TYPE, SEP } from './models.js';

export class MoneyStore {
  constructor() {
    this.db = null;
    this.activeMonth = new Date().toISOString().substring(0, 7); // "YYYY-MM"
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
    this.notify();
  }

  get activeAccounts() {
    if (!this.db || !this.db.accounts) return [];
    return this.db.accounts.filter(a => !a.inactive);
  }

  get accountsByType() {
    const map = {
      "Corrente": [],
      "Poupança": [],
      "Cartão de crédito": [],
      "Investimento": [],
      "Dinheiro": []
    };
    for (const a of this.activeAccounts) {
      const type = a.type || "Corrente";
      if (!map[type]) map[type] = [];
      map[type].push(a);
    }
    return map;
  }

  accountById(id) {
    return this.db?.accounts?.find(a => a.id === id) || null;
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

  // Get recent transactions for an account or all accounts
  getRecentTransactions(accId = null, limit = 20) {
    if (!this.db || !this.db.txs) return [];
    let list = this.db.txs;
    if (accId) {
      list = list.filter(t => t.acc === accId);
    }
    // Sort descending by date, then id
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
      const subs = cats.filter(c => c.parent === p.name);
      if (subs.length === 0) {
        paths.push(p.name);
      } else {
        for (const s of subs) {
          paths.push(`${p.name}${SEP}${s.name}`);
        }
      }
    }
    return paths.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  // Frequent payees auto-complete suggestions
  getFrequentPayees() {
    if (!this.db || !this.db.txs) return [];
    const map = new Map();
    for (const tx of this.db.txs) {
      if (tx.auto || tx.xfer || !tx.payee) continue;
      const clean = tx.payee.replace(/\s\(\d+\/\d+\)$/, '').trim();
      if (!clean) continue;
      if (!map.has(clean)) {
        map.set(clean, {
          payee: clean,
          cat: tx.cat || '',
          isExpense: tx.amt < 0,
          count: 1,
          lastDate: tx.date
        });
      } else {
        const item = map.get(clean);
        item.count += 1;
        if (tx.date > item.lastDate) {
          item.lastDate = tx.date;
          item.cat = tx.cat || item.cat;
          item.isExpense = tx.amt < 0;
        }
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);
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
    peerId = null
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

    for (let i = 0; i < count; i++) {
      const txDate = i === 0 ? date : addMonths(date, i);
      const suffix = count > 1 ? ` (${i + 1}/${count})` : '';
      const installmentPayee = `${payee.trim()}${suffix}`;
      const instCents = (i === 0 ? unitAmt + remainder : unitAmt);
      const finalAmt = isXfer ? -instCents : (signedAmt < 0 ? -instCents : instCents);

      const baseIk = isCard ? invKeyFor(curAcc.card, txDate) : null;
      const xferId = isXfer ? uid() : null;

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
        rec: false,
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
          rec: false,
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
    this.notify();
    return createdTxs;
  }
}

export const store = new MoneyStore();
