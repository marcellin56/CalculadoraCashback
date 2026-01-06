import { Tier, PlatformConfig, Platform } from './types';

// WEEKLY LIVE CASINO CONFIG (GENERIC / 7K / CASSINO)
export const WEEKLY_MIN_CASHBACK = 0.50;
export const WEEKLY_MAX_CASHBACK = 5000.00;
export const WEEKLY_CALC_LIMIT_BASE = 100000.00; // 5% of 100k = 5k

export const WEEKLY_TIERS: Tier[] = [
  { min: 1.00, max: 499.99, percent: 0.01 },
  { min: 500.00, max: 999.99, percent: 0.02 },
  { min: 1000.00, max: 1499.99, percent: 0.03 },
  { min: 1500.00, max: 4999.99, percent: 0.04 },
  { min: 5000.00, max: Infinity, percent: 0.05 },
];

// DAILY SLOTS CONFIG (GENERIC / 7K / CASSINO)
export const DAILY_MIN_CASHBACK = 0.01;
export const DAILY_MAX_CASHBACK = 5000.00;
export const DAILY_CALC_LIMIT_BASE = 20000.00; // 25% of 20k = 5k

export const DAILY_TIERS: Tier[] = [
  { min: 1.00, max: 399.99, percent: 0.02 },
  { min: 400.00, max: 999.99, percent: 0.04 },
  { min: 1000.00, max: 4999.99, percent: 0.06 },
  { min: 5000.00, max: 9999.99, percent: 0.08 },
  { min: 10000.00, max: 11999.99, percent: 0.12 },
  { min: 12000.00, max: 19999.99, percent: 0.15 },
  { min: 20000.00, max: Infinity, percent: 0.25 },
];

// VERA BET CONFIGS
export const VERA_WEEKLY_MIN_CASHBACK = 0.01;
// VERA WEEKLY TIERS match generic ones, but we define separate constant for clarity if needed, 
// but since they are identical in ranges/percents, we can reuse WEEKLY_TIERS in logic or handle specific differences (like min cashback) in service.

export const VERA_DAILY_TIERS: Tier[] = [
  { min: 1.00, max: 299.99, percent: 0.02 },
  { min: 300.00, max: 999.99, percent: 0.04 },
  { min: 1000.00, max: 4999.99, percent: 0.06 },
  { min: 5000.00, max: 14999.99, percent: 0.08 },
  { min: 15000.00, max: 24999.99, percent: 0.10 },
  { min: 25000.00, max: 29999.99, percent: 0.15 },
  { min: 30000.00, max: Infinity, percent: 0.20 },
];
// For Vera: Max 20% capped at 5000. Base = 5000 / 0.20 = 25000.
export const VERA_DAILY_CALC_LIMIT_BASE = 25000.00; 


// AVIATOR DAILY CONFIG (Same logic as Slots, separate context)
export const AVIATOR_MIN_CASHBACK = 0.01;
export const AVIATOR_MAX_CASHBACK = 5000.00;
export const AVIATOR_CALC_LIMIT_BASE = 20000.00;
export const AVIATOR_TIERS: Tier[] = DAILY_TIERS; 

// SPORTS WEEKLY CONFIG
export const SPORTS_MIN_CASHBACK = 0.01; 
export const SPORTS_MAX_CASHBACK = 5000.00;
export const SPORTS_CALC_LIMIT_BASE = 50000.00; // 10% of 50k = 5k

export const SPORTS_TIERS: Tier[] = [
  { min: 0.01, max: 499.99, percent: 0.02 },
  { min: 500.00, max: 1999.99, percent: 0.03 },
  { min: 2000.00, max: 9999.99, percent: 0.04 },
  { min: 10000.00, max: 19999.99, percent: 0.05 },
  { min: 20000.00, max: 24999.99, percent: 0.06 },
  { min: 25000.00, max: 29999.99, percent: 0.07 },
  { min: 30000.00, max: 49999.99, percent: 0.08 },
  { min: 50000.00, max: Infinity, percent: 0.10 },
];

// EXCLUSIONS
export const EXCLUDED_GAMES_WEEKLY = [
  "Dragon Tiger", "Bac Bo", "Double Red Dog", "Sic BO", "Jogos de Crash", "Betting Games"
];

export const VERA_EXCLUDED_GAMES_WEEKLY = [
  "Dragon Tiger", "Bac Bo", "Double Red Dog", "Baccarat", "Sic BO", "Jogos de Crash"
];

export const EXCLUDED_GAMES_DAILY = [
  "Jogos de Crash", "Vídeo Pôquer", "Inbet", "Mines", "Banana Mines", "Jogos Zeus", "Jogos de Mesa"
];

export const VERA_EXCLUDED_GAMES_DAILY = [
  "Crash (Aviator, JetX...)", "Apostas Esportivas", "Jogos de Mesa", "Vídeo Pôquer", "Cassino Ao Vivo"
];

export const EXCLUDED_GAMES_AVIATOR = [
  "JetX", "Spaceman", "Mines", "Banana Mines", "Aviator Spribe", "Slots", "Cassino Ao Vivo"
];

export const EXCLUDED_GAMES_SPORTS = [
  "Apostas Simples", "Odds < 3.0", "Odds > 1000", "Cash-out", "Apostas Canceladas"
];

// PLATFORM CONFIGURATIONS
export const PLATFORMS: Record<Platform, PlatformConfig> = {
  '7K': {
    id: '7K',
    name: '7K.bet',
    logoUrl: 'https://static.7k.bet.br/deploy-b069a4860b710040d19c5e68e12da4d03edfddcb-f1f5881162dd0141d289/assets/images/logo.svg',
    colors: {
      default: '#ACC90D', // 7K Green/Lime
      dark: '#859c0b',    // Darker Lime for hover/gradients
      light: '#e1f56c',   // Lighter Lime
    },
    textOnBrand: 'text-neutral-900',
    hasSports: true,
    hasAviator: false,
    rules: {
        weekly: {
            deliveryText: "Entre 12h das segundas-feiras até as 12h das terças-feiras",
            maxDays: "48h"
        },
        daily: {
            deliveryText: "A partir das 12h do dia seguinte",
            maxDays: "48h"
        }
    }
  },
  'Cassino': {
    id: 'Cassino',
    name: 'Cassino.bet.br',
    logoUrl: 'https://imagedelivery.net/BgH9d8bzsn4n0yijn4h7IQ/4b455706-eb40-453d-0658-532b576f7400/w=1200?quality=95&format=auto',
    colors: {
      default: '#0196E5', // Blue
      dark: '#017ac0',    // Dark Blue
      light: '#4fbaf2',   // Light Blue
    },
    textOnBrand: 'text-white',
    hasSports: false,
    hasAviator: true,
    rules: {
        weekly: {
            deliveryText: "Toda segunda-feira a partir das 12h",
            maxDays: "24h"
        },
        daily: {
            deliveryText: "A partir das 12h do dia seguinte",
            maxDays: "24h"
        }
    }
  },
  'Vera': {
    id: 'Vera',
    name: 'Vera.bet',
    logoUrl: 'https://atendimento.vera.bet.br/hc/theming_assets/01JQVECC3WCCKQ4TFM37B3TH0Z',
    colors: {
      default: '#06E05B', // Vera Green
      dark: '#05c04d',    // Darker Green
      light: '#6effa0',   // Lighter Green
    },
    textOnBrand: 'text-neutral-900', // Black text on bright green
    hasSports: false,
    hasAviator: false,
    rules: {
        weekly: {
            deliveryText: "Toda segunda-feira a partir das 12h",
            maxDays: "24h"
        },
        daily: {
            deliveryText: "A partir das 12h do dia seguinte",
            maxDays: "24h"
        }
    }
  }
};