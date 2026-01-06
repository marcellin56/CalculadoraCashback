export type CashbackMode = 'weekly' | 'daily' | 'sports' | 'aviator';
export type Platform = '7K' | 'Cassino' | 'Vera';

export interface Tier {
  min: number;
  max: number;
  percent: number;
  label?: string;
}

export interface CashbackResult {
  lossAmount: number;
  cashbackAmount: number;
  appliedPercent: number;
  message: string;
}

export interface CalculatorState {
  lossAmount: string;
}

export interface PlatformConfig {
  id: Platform;
  name: string;
  logoUrl: string;
  colors: {
    default: string;
    dark: string;
    light: string;
  };
  textOnBrand: string; // CSS class for text color on brand background (e.g., 'text-white' or 'text-neutral-900')
  hasSports: boolean;
  hasAviator: boolean;
  rules: {
    weekly: {
        deliveryText: string;
        maxDays: string;
    };
    daily: {
        deliveryText: string;
        maxDays: string;
    };
  }
}