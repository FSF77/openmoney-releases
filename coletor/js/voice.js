// OpenMoney Coletor - Voice Recognition & Local NLP Parser Engine
import { normalizeStr, todayISO, parseCurrencyToCents } from './models.js';

// Convert number words in Portuguese to numeric string
const PT_NUMBER_WORDS = {
  'zero': 0, 'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'três': 3, 'tres': 3,
  'quatro': 4, 'cinco': 5, 'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9,
  'dez': 10, 'onze': 11, 'doze': 12, 'treze': 13, 'quatorze': 14, 'catorze': 14,
  'quinze': 15, 'dezesseis': 16, 'dezessete': 17, 'dezoito': 18, 'dezenove': 19,
  'vinte': 20, 'trinta': 30, 'quarenta': 40, 'cinquenta': 50,
  'sessenta': 60, 'setenta': 70, 'oitenta': 80, 'noventa': 90,
  'cem': 100, 'cento': 100, 'duzentos': 200, 'trezentos': 300,
  'quatrocentos': 400, 'quinhentos': 500, 'seiscentos': 600,
  'setecentos': 700, 'oitocentos': 800, 'novecentos': 900,
  'mil': 1000
};

export class VoiceExpenseEngine {
  constructor() {
    this.recognition = null;
    this.isListening = false;
  }

  // Check if browser supports Web Speech API
  isSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  // Start Voice Recognition
  startListening({ onTranscript, onFinal, onError, onStart, onEnd }) {
    if (!this.isSupported()) {
      if (onError) onError(new Error('Reconhecimento de voz não suportado neste navegador.'));
      return;
    }

    const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechClass();
    this.recognition.lang = 'pt-BR';
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    let finalSpokenText = '';

    this.recognition.onstart = () => {
      this.isListening = true;
      if (onStart) onStart();
    };

    this.recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        const text = item[0].transcript;
        if (item.isFinal) {
          finalSpokenText += text + ' ';
        } else {
          interim += text;
        }
      }
      const current = (finalSpokenText + interim).trim();
      if (onTranscript) onTranscript(current);
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (event.error === 'no-speech') {
        if (onError) onError(new Error('Nenhuma fala detectada. Toque no microfone e tente novamente.'));
      } else if (event.error === 'not-allowed') {
        if (onError) onError(new Error('Permissão de microfone negada. Conceda permissão no Safari para usar o comando de voz.'));
      } else {
        if (onError) onError(new Error(`Erro ao reconhecer voz: ${event.error}`));
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      const text = finalSpokenText.trim();
      if (text && onFinal) {
        onFinal(text);
      }
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (err) {
      if (onError) onError(err);
    }
  }

  // Stop listening manually
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  // Parse natural language spoken phrase into OpenMoney fields
  parseVoiceExpense(spokenText, structure) {
    if (!spokenText || typeof spokenText !== 'string') {
      return {
        amt: 0,
        payee: '',
        cat: '',
        accId: null,
        date: todayISO(),
        isExpense: true,
        memo: ''
      };
    }

    const raw = spokenText.trim();
    const lower = raw.toLowerCase();
    const norm = normalizeStr(lower);

    // 1. Detect Type (Receita vs Despesa)
    const incomeWords = ['recebi', 'recebido', 'salario', 'salário', 'reembolso', 'rendimento', 'venda', 'deposito', 'depósito', 'pix recebido', 'estorno'];
    const isExpense = !incomeWords.some(w => norm.includes(normalizeStr(w)));

    // 2. Detect Date
    let date = todayISO();
    if (norm.includes('anteontem')) {
      const d = new Date();
      d.setDate(d.getDate() - 2);
      date = d.toISOString().split('T')[0];
    } else if (norm.includes('ontem')) {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      date = d.toISOString().split('T')[0];
    }

    // 3. Detect Amount (Cents)
    let cents = 0;
    // Try currency format: "R$ 45,90", "45,50", "45.50", "45 reais e 50 centavos", "45 e 50"
    const regexCurrency = /(?:r\$\s*)?(\d{1,5})(?:[.,](\d{1,2}))?\s*(?:reais|real)?(?:\s*e\s*(\d{1,2})\s*(?:centavos)?)?/i;
    const matchCurr = lower.match(regexCurrency);

    if (matchCurr) {
      const reals = parseInt(matchCurr[1], 10) || 0;
      let centPart = 0;
      if (matchCurr[2]) {
        centPart = parseInt(matchCurr[2].padEnd(2, '0').slice(0, 2), 10);
      } else if (matchCurr[3]) {
        centPart = parseInt(matchCurr[3].padEnd(2, '0').slice(0, 2), 10);
      }
      cents = (reals * 100) + centPart;
    }

    // Fallback: search for stand-alone numbers e.g. "almoço 45", "gasolina 100"
    if (cents === 0) {
      const numberMatch = lower.match(/\b(\d{1,6}(?:[.,]\d{2})?)\b/);
      if (numberMatch) {
        cents = parseCurrencyToCents(numberMatch[1]);
      }
    }

    // 4. Detect Account
    let matchedAccId = null;
    if (structure && Array.isArray(structure.accounts)) {
      const activeAccs = structure.accounts.filter(a => !a.inactive);

      // Check account names in spoken text
      for (const acc of activeAccs) {
        const normAccName = normalizeStr(acc.name);
        if (normAccName && norm.includes(normAccName)) {
          matchedAccId = acc.id;
          break;
        }
      }

      // Check generic keywords if still not matched
      if (!matchedAccId) {
        if (norm.includes('dinheiro') || norm.includes('carteira') || norm.includes('especie')) {
          const cashAcc = activeAccs.find(a => a.type === 'Dinheiro');
          if (cashAcc) matchedAccId = cashAcc.id;
        } else if (norm.includes('cartao') || norm.includes('cartão') || norm.includes('credito') || norm.includes('crédito')) {
          const cardAcc = activeAccs.find(a => a.type === 'Cartão de crédito');
          if (cardAcc) matchedAccId = cardAcc.id;
        } else if (norm.includes('poupanca') || norm.includes('poupança')) {
          const savAcc = activeAccs.find(a => a.type === 'Poupança');
          if (savAcc) matchedAccId = savAcc.id;
        }
      }

      // Default account: favorite account or first active
      if (!matchedAccId) {
        const fav = activeAccs.find(a => a.favorite);
        matchedAccId = fav ? fav.id : (activeAccs[0]?.id || null);
      }
    }

    // 5. Detect Favorecido and Category from Frequent Payees & Context
    let matchedPayee = '';
    let matchedCat = '';

    if (structure && Array.isArray(structure.frequentPayees)) {
      // Find if any frequent payee is spoken in text (longest name match first)
      const sortedPayees = [...structure.frequentPayees].sort((a, b) => b.payee.length - a.payee.length);
      for (const p of sortedPayees) {
        const normPayee = normalizeStr(p.payee);
        if (normPayee && norm.includes(normPayee)) {
          matchedPayee = p.payee;
          matchedCat = p.cat || '';
          break;
        }
      }
    }

    // Keyword Category Fallback Mapping
    const CATEGORY_KEYWORDS = [
      { words: ['almoco', 'almoço', 'jantar', 'refeicao', 'refeição', 'restaurante', 'mcdonalds', 'burguer', 'burger', 'pizza', 'ifood', 'lanche'], catContains: ['Restaurante', 'Alimentação'] },
      { words: ['supermercado', 'mercado', 'compras', 'acougue', 'açougue', 'hortifruti'], catContains: ['Supermercado', 'Alimentação'] },
      { words: ['posto', 'gasolina', 'combustivel', 'combustível', 'etanol', 'abastecer', 'abasteci'], catContains: ['Combustível', 'Transporte'] },
      { words: ['farmacia', 'farmácia', 'drogaria', 'remedio', 'remédio', 'medicamento'], catContains: ['Farmácia', 'Saúde'] },
      { words: ['padaria', 'pao', 'pão', 'cafe', 'café'], catContains: ['Padaria', 'Alimentação'] },
      { words: ['uber', 'taxi', 'táxi', 'corrida', 'estacionamento', 'pedagio', 'pedágio'], catContains: ['Transporte'] },
      { words: ['cinema', 'filme', 'teatro', 'show', 'ingresso', 'lazer'], catContains: ['Lazer'] },
      { words: ['salario', 'salário', 'pagamento', 'pro-labore'], catContains: ['Salário', 'Receita'] }
    ];

    if (!matchedCat && structure && Array.isArray(structure.cats)) {
      for (const rule of CATEGORY_KEYWORDS) {
        const hasWord = rule.words.some(w => norm.includes(normalizeStr(w)));
        if (hasWord) {
          const found = structure.cats.find(c => {
            const p = normalizeStr(c.path || c.name || '');
            return rule.catContains.some(kw => p.includes(normalizeStr(kw)));
          });
          if (found) {
            matchedCat = found.path || found.name;
            break;
          }
        }
      }
    }

    // 6. Extract Payee Name from clean remaining text if not matched to frequent payee
    if (!matchedPayee) {
      // Remove stopwords, amounts, accounts, dates
      let cleanWords = lower
        .replace(/r\$\s*[\d,.]+/g, '')
        .replace(/\b\d+([.,]\d+)?\b/g, '')
        .replace(/\b(reais|real|centavos|paguei|gastei|comprei|recebi|no|na|nos|nas|de|do|da|dos|das|com|em|para|por|hoje|ontem|anteontem|cartao|cartão|dinheiro|debito|débito|credito|crédito|conta)\b/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // If specific account name was detected, strip it from payee text
      if (structure && Array.isArray(structure.accounts)) {
        for (const acc of structure.accounts) {
          const accLower = acc.name.toLowerCase();
          cleanWords = cleanWords.replace(new RegExp(`\\b${accLower}\\b`, 'gi'), '').trim();
        }
      }

      if (cleanWords.length >= 2) {
        // Capitalize words
        matchedPayee = cleanWords
          .split(' ')
          .filter(Boolean)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }
    }

    return {
      rawText: raw,
      amt: cents,
      payee: matchedPayee || 'Lançamento por Voz',
      cat: matchedCat,
      accId: matchedAccId,
      date: date,
      isExpense: isExpense,
      memo: `Voz: "${raw}"`
    };
  }
}

export const voiceExpenseEngine = new VoiceExpenseEngine();
