import * as XLSX from 'xlsx';
import { 
  EXCLUDED_GAMES_WEEKLY, EXCLUDED_GAMES_DAILY, 
  VERA_EXCLUDED_GAMES_WEEKLY, VERA_EXCLUDED_GAMES_DAILY,
  EXCLUDED_GAMES_AVIATOR, EXCLUDED_GAMES_SPORTS
} from '../constants';
import { calculateCashback } from './cashbackService';
import { Platform, CashbackMode, ExcelRow, BatchReport, ProcessedEntry } from '../types';

// Helper to normalize strings for comparison
const normalize = (str: string) => str ? str.toLowerCase().trim() : '';

// Check if game matches any exclusion list
const isExcluded = (gameName: string, exclusionList: string[]) => {
  const normGame = normalize(gameName);
  return exclusionList.some(excluded => normGame.includes(normalize(excluded)));
};

// Identify category based on Game Name and Platform
const identifyCategory = (gameName: string, platform: Platform): CashbackMode | null => {
  const normGame = normalize(gameName);

  // 1. Check Aviator (Specific)
  if (normGame.includes('aviator') && platform !== '7K') { // 7K doesn't have aviator cashback specific
    return 'aviator';
  }

  // 2. Check Sports
  if (normGame.includes('sport') || normGame.includes('esport') || normGame.includes('apostas') || normGame.includes('odds')) {
    if (platform === '7K') return 'sports';
    return null; // Other platforms might not have specific sports cashback configured in this app
  }

  // 3. Check Live Casino (Weekly)
  // Keywords common in Live Casino
  const liveKeywords = ['live', 'ao vivo', 'roulette', 'roleta', 'blackjack', 'baccarat', 'crazy time', 'monopoly', 'mega ball', 'dream catcher', 'sic bo', 'dragon tiger'];
  const isLiveCandidate = liveKeywords.some(k => normGame.includes(k));

  if (isLiveCandidate) {
    const excluded = platform === 'Vera' ? VERA_EXCLUDED_GAMES_WEEKLY : EXCLUDED_GAMES_WEEKLY;
    if (!isExcluded(gameName, excluded)) {
      return 'weekly';
    }
  }

  // 4. Check Slots (Daily)
  // Default fallback for most games, but must check exclusions
  const dailyExcluded = platform === 'Vera' ? VERA_EXCLUDED_GAMES_DAILY : EXCLUDED_GAMES_DAILY;
  
  if (!isExcluded(gameName, dailyExcluded)) {
    return 'daily';
  }

  return null; // Eligible for neither
};

// Helper to find value across potential keys (exact or substring match)
const findValue = (row: any, keys: string[]) => {
  const rowKeys = Object.keys(row);
  for (const targetKey of keys) {
    // 1. Exact match (case insensitive)
    let match = rowKeys.find(k => normalize(k) === normalize(targetKey));
    if (match) return row[match];
    
    // 2. Contains match (e.g. "Valor Apostado (R$)" contains "apostado")
    match = rowKeys.find(k => normalize(k).includes(normalize(targetKey)));
    if (match) return row[match];
  }
  return undefined;
};

const parseNumber = (val: any): number => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    let clean = val.trim();
    if (clean === '') return 0;
    // Handle standard float "100.50" or PT format "100,50" if simple
    // Removing currency symbols if any
    clean = clean.replace(/[R$\s]/g, '');
    
    if (clean.includes(',') && !clean.includes('.')) {
        clean = clean.replace(',', '.');
    }
    return parseFloat(clean) || 0;
  }
  return 0;
};

// Helper to get Monday of the week given a DD/MM/YYYY date
const getWeekStart = (dateStr: string) => {
    const [d, m, y] = dateStr.split('/').map(Number);
    const date = new Date(y, m - 1, d);
    const day = date.getDay(); // 0 (Sun) to 6 (Sat)
    // Week is Mon-Sun. If Sun(0), it is 6 days after Mon. If Mon(1), 0 days after Mon.
    const diff = day === 0 ? 6 : day - 1; 
    const monday = new Date(date);
    monday.setDate(date.getDate() - diff);
    return monday.toLocaleDateString('pt-BR');
};

export const processFile = async (file: File, platform: Platform): Promise<BatchReport> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        // Map key to object
        const aggregations: Record<string, { date: string, mode: CashbackMode, totalLoss: number }> = {};

        jsonData.forEach(row => {
          // 1. Get Date
          let rawDate = findValue(row, ['Data', 'Date', 'Dia']);
          if (!rawDate) return;

          let dateStr = '';
          if (typeof rawDate === 'number') {
            const dateObj = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
            dateStr = dateObj.toLocaleDateString('pt-BR');
          } else {
             const str = String(rawDate).trim();
             // Check YYYY-MM-DD
             if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
                 const [y, m, d] = str.split('-');
                 dateStr = `${d}/${m}/${y}`;
             } else {
                 dateStr = str;
             }
          }

          // 2. Get Game Name
          let gameVal = findValue(row, ['Tipo de Jogo', 'Game', 'Jogo', 'Nome']);
          if (!gameVal) return;

          // 3. Get Financials
          let betVal = findValue(row, ['Valor Apostado', 'Bet', 'Aposta']);
          let winVal = findValue(row, ['Valor Ganho', 'Win', 'Ganho']);
          let ggrVal = findValue(row, ['GGR', 'PL', 'P/L', 'Win/Loss']);

          let finalLoss = 0;

          if (betVal !== undefined && winVal !== undefined) {
              finalLoss = parseNumber(betVal) - parseNumber(winVal);
          } else if (ggrVal !== undefined) {
              finalLoss = parseNumber(ggrVal);
              // Fallback: In some reports GGR is negative for player loss. 
              // But standard convention in this app is "Loss Amount" (Positive).
              // If we see -20 in GGR column and Bet/Win are missing, we might need to invert.
              // However, based on the prompt's CSV: GGR -20 means Bet 100 Win 80.
              // So Player Loss is 20. House GGR is 20 (usually).
              // But the user CSV says "GGR (R$)" is -20.
              // If we are strictly reading the user's provided sample:
              // Bet 100, Win 80, GGR -20.
              // Loss = 100 - 80 = 20.
              // If only GGR is available and it is negative, it likely implies player loss in that specific user context.
              if (finalLoss < 0 && betVal === undefined) {
                  finalLoss = Math.abs(finalLoss);
              }
          }

          const mode = identifyCategory(gameVal, platform);
          if (mode) {
             let dateKey = dateStr;
             let displayDate = dateStr;

             // Weekly and Sports are aggregated by WEEK
             if (mode === 'weekly' || mode === 'sports') {
                 dateKey = getWeekStart(dateStr);
                 // We keep the dateKey as the Monday of that week
                 displayDate = dateKey; 
             }

             const key = `${dateKey}-${mode}`;
             if (!aggregations[key]) {
               aggregations[key] = { date: displayDate, mode, totalLoss: 0 };
             }
             aggregations[key].totalLoss += finalLoss;
          }
        });

        // Calculate Cashback for Aggregations
        const results: ProcessedEntry[] = [];
        const detailsByMode = { weekly: 0, daily: 0, sports: 0, aviator: 0 };
        let totalCashback = 0;

        Object.values(aggregations).forEach(item => {
           // We only give cashback on POSITIVE LOSS
           if (item.totalLoss > 0) {
              const calc = calculateCashback(item.totalLoss, item.mode, platform);
              // Only add if there is actual cashback (meets min requirements)
              if (calc.cashbackAmount > 0) {
                  results.push({
                      date: item.date,
                      mode: item.mode,
                      loss: item.totalLoss,
                      cashback: calc.cashbackAmount,
                      percent: calc.appliedPercent
                  });
                  detailsByMode[item.mode] += calc.cashbackAmount;
                  totalCashback += calc.cashbackAmount;
              }
           }
        });

        // Sort by Date
        results.sort((a, b) => {
           const [dA, mA, yA] = a.date.split('/').map(Number);
           const [dB, mB, yB] = b.date.split('/').map(Number);
           const dateA = new Date(yA, mA - 1, dA).getTime();
           const dateB = new Date(yB, mB - 1, dB).getTime();
           return dateA - dateB;
        });

        resolve({
            summary: results,
            totalCashback,
            detailsByMode
        });

      } catch (err) {
        reject(err);
      }
    };

    reader.readAsArrayBuffer(file);
  });
};