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

// Determine invoice key (YYYY-MM) based on card closing day (closeDay)
export function invKeyFor(cardConfig, dateStr) {
  if (!cardConfig || typeof cardConfig.closeDay !== 'number') {
    return dateStr.substring(0, 7);
  }
  const parts = dateStr.split('-');
  const year = parts[0];
  const month = parts[1];
  const day = parseInt(parts[2], 10);

  const ym = `${year}-${month}`;
  if (day <= cardConfig.closeDay) {
    return ym;
  }
  return addMonths(ym, 1);
}
