import { 
  WEEKLY_TIERS, WEEKLY_MIN_CASHBACK, WEEKLY_MAX_CASHBACK, WEEKLY_CALC_LIMIT_BASE,
  DAILY_TIERS, DAILY_MIN_CASHBACK, DAILY_MAX_CASHBACK, DAILY_CALC_LIMIT_BASE,
  SPORTS_TIERS, SPORTS_MIN_CASHBACK, SPORTS_MAX_CASHBACK, SPORTS_CALC_LIMIT_BASE,
  AVIATOR_TIERS, AVIATOR_MIN_CASHBACK, AVIATOR_MAX_CASHBACK, AVIATOR_CALC_LIMIT_BASE,
  VERA_DAILY_TIERS, VERA_WEEKLY_MIN_CASHBACK, VERA_DAILY_CALC_LIMIT_BASE
} from '../constants';
import { CashbackMode, Platform, CashbackResult, Tier } from '../types';

// Helper for truncation without rounding (e.g. 1.9994 -> 1.99)
const truncateToTwoDecimals = (val: number): number => {
    // 1. Handle precision issues (e.g. 1.15 -> 1.1499999) using toFixed(10)
    // 2. Multiply by 100, Floor, Divide by 100
    const fixed = parseFloat(val.toFixed(10));
    return Math.floor(fixed * 100) / 100;
};

export const calculateCashback = (
  lossAmount: number, 
  mode: CashbackMode,
  platform: Platform
): CashbackResult => {
  // Input represents the absolute value of the loss (Saldo Negativo)
  // E.g. Input 100.00 means the player lost R$ 100.00

  if (lossAmount <= 0) {
    return {
      lossAmount: lossAmount,
      cashbackAmount: 0,
      appliedPercent: 0,
      message: "Valor inválido ou sem prejuízo."
    };
  }

  // Determine Tiers and Limits based on mode and platform
  let tiers: Tier[], minCashback: number, maxCashback: number, baseLimit: number;

  switch (mode) {
    case 'weekly':
      tiers = WEEKLY_TIERS; // Vera uses same weekly tiers structure
      minCashback = platform === 'Vera' ? VERA_WEEKLY_MIN_CASHBACK : WEEKLY_MIN_CASHBACK;
      maxCashback = WEEKLY_MAX_CASHBACK;
      baseLimit = WEEKLY_CALC_LIMIT_BASE;
      break;
    case 'daily':
      if (platform === 'Vera') {
        tiers = VERA_DAILY_TIERS;
        minCashback = DAILY_MIN_CASHBACK; // Vera is also 0.01
        maxCashback = DAILY_MAX_CASHBACK;
        baseLimit = VERA_DAILY_CALC_LIMIT_BASE;
      } else {
        tiers = DAILY_TIERS;
        minCashback = DAILY_MIN_CASHBACK;
        maxCashback = DAILY_MAX_CASHBACK;
        baseLimit = DAILY_CALC_LIMIT_BASE;
      }
      break;
    case 'sports':
      tiers = SPORTS_TIERS;
      minCashback = SPORTS_MIN_CASHBACK;
      maxCashback = SPORTS_MAX_CASHBACK;
      baseLimit = SPORTS_CALC_LIMIT_BASE;
      break;
    case 'aviator':
      tiers = AVIATOR_TIERS;
      minCashback = AVIATOR_MIN_CASHBACK;
      maxCashback = AVIATOR_MAX_CASHBACK;
      baseLimit = AVIATOR_CALC_LIMIT_BASE;
      break;
    default:
       // Fallback
       tiers = WEEKLY_TIERS;
       minCashback = 0;
       maxCashback = 0;
       baseLimit = 0;
  }

  // Find percentage based on the loss amount
  const tier = tiers.find(t => lossAmount >= t.min && lossAmount <= t.max);
  
  if (!tier) {
    return {
      lossAmount: lossAmount,
      cashbackAmount: 0,
      appliedPercent: 0,
      message: `Perda de R$ ${lossAmount.toFixed(2)} não atingiu o mínimo para cashback.`
    };
  }

  // Apply Calculation Logic
  // The rule says "limitado sobre até R$ X". This means if Loss > Limit, we calculate based on Limit.
  const calculationBase = Math.min(lossAmount, baseLimit);
  let cashback = calculationBase * tier.percent;

  // Apply strict truncation logic (No rounding)
  // Example: 1.9994 becomes 1.99
  cashback = truncateToTwoDecimals(cashback);

  // Clamp constraints
  if (cashback < minCashback) cashback = 0;
  if (cashback > maxCashback) cashback = maxCashback;

  return {
    lossAmount: lossAmount,
    cashbackAmount: cashback,
    appliedPercent: tier.percent,
    message: "Cashback disponível!"
  };
};

export const formatCurrency = (val: number): string => {
  // Truncate to 2 decimal places before formatting to prevent visual rounding up
  const truncated = truncateToTwoDecimals(val);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(truncated);
};

export const formatPercent = (val: number): string => {
  return `${(val * 100).toFixed(0)}%`;
};