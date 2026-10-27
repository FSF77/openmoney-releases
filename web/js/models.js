// OpenMoney Models & Business Logic Constants
export const SEP = " › ";
export const CARD_TYPE = "Cartão de crédito";
export const ACCOUNT_TYPES = [
  "Corrente",
  "Poupança",
  "Cartão de crédito",
  "Investimento",
  "Dinheiro"
];

// Generates short unique ID (7 chars) like Swift OpenMoney
export function uid() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Format integer cents into BRL currency: 12345 -> "R$ 123,45"
export function formatCurrency(cents, showSign = false) {
  if (typeof cents !== 'number' || isNaN(cents)) cents = 0;
  const isNegative = cents < 0;
  const absVal = Math.abs(cents);
  const reals = Math.floor(absVal / 100);
  const remainder = absVal % 100;
  
  const formattedReals = reals.toLocaleString('pt-BR');
  const formattedCents = remainder.toString().padStart(2, '0');
  const str = `R$ ${formattedReals},${formattedCents}`;
  
  if (isNegative) return `-${str}`;
  if (showSign && cents > 0) return `+${str}`;
  return str;
}

// Parse text input to integer cents
export function parseCurrencyToCents(raw) {
  if (!raw) return 0;
  let clean = raw.toString().trim()
    .replace(/^R\$\s?/, '')
    .replace(/\s/g, '');

  if (!clean) return 0;

  // Handle dot as thousand separator and comma as decimal
  if (clean.includes(',') && clean.includes('.')) {
    clean = clean.replace(/\./g, '').replace(',', '.');
  } else if (clean.includes(',')) {
    clean = clean.replace(',', '.');
  }

  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

// Return current date in ISO "YYYY-MM-DD"
export function todayISO() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format ISO "YYYY-MM-DD" to Brazilian format "DD/MM/AAAA"
export function formatDateBR(iso) {
  if (!iso || iso.length < 10) return iso || '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// Add months to a YYYY-MM-DD or YYYY-MM
export function addMonths(dateStr, monthsToAdd) {
  const parts = dateStr.split('-');
  let year = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10) - 1 + monthsToAdd;
  const day = parts[2] ? parseInt(parts[2], 10) : 1;

  const targetDate = new Date(year, month, 1);
  const targetYear = targetDate.getFullYear();
  const targetMonth = String(targetDate.getMonth() + 1).padStart(2, '0');

  if (parts.length === 2) {
    return `${targetYear}-${targetMonth}`;
  }

  // Clamp day to last day of target month
  const maxDays = new Date(targetYear, targetDate.getMonth() + 1, 0).getDate();
  const clampedDay = String(Math.min(day, maxDays)).padStart(2, '0');
  return `${targetYear}-${targetMonth}-${clampedDay}`;
}

// Determine invoice key (YYYY-MM) based on card closing day (closeDay) and due day (dueDay)
export function invKeyFor(cardConfig, dateStr) {
  if (!cardConfig || typeof cardConfig.closeDay !== 'number') {
    return dateStr.substring(0, 7);
  }
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return dateStr.substring(0, 7);
  const k = `${parts[0]}-${String(parts[1]).padStart(2, '0')}`;
  const closeMonth = parts[2] > cardConfig.closeDay ? addMonths(k, 1) : k;
  const dueDay = cardConfig.dueDay || cardConfig.closeDay;
  return dueDay <= cardConfig.closeDay ? addMonths(closeMonth, 1) : closeMonth;
}

export function invDates(cardConfig, key) {
  const parts = key.split('-').map(Number);
  if (parts.length !== 2) return { close: key + '-01', due: key + '-10' };
  const dueDay = cardConfig.dueDay || 10;
  const closeDay = cardConfig.closeDay || 1;
  const closeMonth = dueDay <= closeDay ? addMonths(key, -1) : key;
  const cParts = closeMonth.split('-').map(Number);
  const maxCloseDays = new Date(cParts[0], cParts[1], 0).getDate();
  const maxDueDays = new Date(parts[0], parts[1], 0).getDate();
  const cDay = String(Math.min(closeDay, maxCloseDays)).padStart(2, '0');
  const dDay = String(Math.min(dueDay, maxDueDays)).padStart(2, '0');
  return {
    close: `${closeMonth}-${cDay}`,
    due: `${key}-${dDay}`
  };
}

export function isVigenteInvoice(cardConfig, invoiceKey, account, today = todayISO()) {
  const currentOpenKey = invKeyFor(cardConfig, today);
  if (invoiceKey === currentOpenKey) return true;

  const dates = invDates(cardConfig, invoiceKey);
  const dueDate = (account && account.invoices && account.invoices[invoiceKey] && account.invoices[invoiceKey].due) || dates.due;
  const closeDate = (account && account.invoices && account.invoices[invoiceKey] && account.invoices[invoiceKey].close) || dates.close;

  if (closeDate <= today && dueDate >= today) {
    return true;
  }
  return false;
}

// Normalize text for accent-insensitive search
export function normalizeStr(str) {
  if (!str) return '';
  return str.toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Format "YYYY-MM" to readable Brazilian month name "Outubro de 2026"
export function formatMonthBR(ym) {
  if (!ym || ym.length < 7) return ym || '';
  const [year, month] = ym.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const idx = parseInt(month, 10) - 1;
  const name = monthNames[idx] || month;
  return `${name} de ${year}`;
}

