/**
 * Type Definitions for Trading Journal
 * @description Comprehensive type safety for the trading dashboard
 */

// ==================== ENUMS ====================

export type AssetType = "crypto" | "stock";
export type OrderType = "long" | "short";

// ==================== PLATFORM TYPES ====================

export type StockPlatform =
  | "ajaib"
  | "stockbit"
  | "ipot"
  | "mirae"
  | "gotrade"
  | "interactive_brokers";

export type CryptoPlatform =
  | "binance"
  | "bybit"
  | "tokocrypto"
  | "indodax"
  | "okx"
  | "reku"
  | "pintu";

export type Platform = StockPlatform | CryptoPlatform;

// ==================== FEE STRUCTURE ====================

export interface FeeStructure {
  buy: number | ((amount: number) => number); // Percentage or function
  sell: number | ((amount: number) => number); // Percentage or function
  type: "percentage" | "flat" | "tiered";
  description?: string;
}

export interface PlatformConfig {
  id: Platform;
  name: string;
  logo: string;
  assetType: AssetType;
  fees: FeeStructure;
  color: string; // Brand color
}

// ==================== TRADING LOG ====================

export interface TradingLog {
  id: string;
  user_id: string;

  // Asset Information
  asset_name: string;
  asset_type: AssetType;
  platform_id: Platform;

  // Trade Details
  order_type: OrderType;
  entry_price: number;
  exit_price: number;
  quantity: number;

  // Financial Calculations
  gross_pnl: number;
  total_fee: number;
  net_pnl: number;

  // Additional Information
  notes?: string;
  tags?: string[]; // Psychology tags

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ==================== FORM STATE ====================

export interface TradingFormState {
  assetName: string;
  assetType: AssetType;
  platformId: Platform | "";
  orderType: OrderType;
  entryPrice: string;
  exitPrice: string;
  quantity: string;
  notes: string;
  tags: string[]; // Psychology tags
}

// ==================== CALCULATION RESULTS ====================

export interface FeeCalculation {
  buyFee: number;
  sellFee: number;
  totalFee: number;
  breakdown: {
    buyPercentage: number;
    sellPercentage: number;
    buyAmount: number;
    sellAmount: number;
  };
}

export interface PnLCalculation {
  grossPnL: number;
  fees: FeeCalculation;
  netPnL: number;
  roi: number;
  totalValue: number;
  profitLoss: "profit" | "loss" | "neutral";
}

// ==================== DASHBOARD STATS ====================

export interface TradingStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalGrossPnL: number;
  totalFeesPaid: number;
  totalNetPnL: number;
  avgPnLPerTrade: number;
  bestTrade: number;
  worstTrade: number;
}

// ==================== API RESPONSES ====================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface CreateTradePayload {
  asset_name: string;
  asset_type: AssetType;
  platform_id: Platform;
  order_type: OrderType;
  entry_price: number;
  exit_price: number;
  quantity: number;
  gross_pnl: number;
  total_fee: number;
  net_pnl: number;
  notes?: string;
}

// ==================== TIMEFRAME FILTERING ====================

export type TimeframeFilter = 
  | 'last_trade'
  | '7d'
  | '1m'
  | '3m'
  | '4m'
  | '12m'
  | 'all_time';

export interface TimeframeOption {
  id: TimeframeFilter;
  label: string;
  daysBack?: number; // undefined for 'all_time'
}

// ==================== VIEW MODES ====================

export type ViewMode = 'minimalist' | 'kece_abis';

// ==================== SHAREABLE CARD ====================

export interface ShareableCardData {
  assetName: string;
  assetLogo: string;
  platformName: string;
  platformLogo: string;
  netPnL: number;
  roi: number;
  assetType: AssetType;
  timestamp: string;
}

// ==================== PSYCHOLOGY TAGS ====================

export type PsychologyTag = 
  | 'disciplined'
  | 'fomo'
  | 'revenge_trade'
  | 'greed'
  | 'fear'
  | 'patience'
  | 'overconfident'
  | 'fearful'
  | 'planned'
  | 'impulsive'
  | 'emotional'
  | 'analytical';

export interface PsychologyTagOption {
  id: PsychologyTag;
  label: string;
  emoji: string;
  category: 'positive' | 'negative' | 'neutral';
  color: string;
}

// ==================== ADVANCED ANALYTICS ====================

export interface MistakeCostAnalysis {
  mistakeTrades: number;
  totalMistakeCost: number;
  avgMistakeCost: number;
  fomoTrades: number;
  fomoTotalCost: number;
  revengeTrades: number;
  revengeTotalCost: number;
  disciplinedTrades: number;
  disciplinedTotalPnL: number;
  disciplinedAvgPnL: number;
  disciplinedWinRate: number;
  mistakeWinRate: number;
}

export interface TradingHoursStats {
  hour: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  avgPnL: number;
  bestTrade: number;
  worstTrade: number;
}

export interface ExpectedValueAnalysis {
  totalTrades: number;
  winningTrades: number;
  winPercentage: number;
  avgWin: number;
  losingTrades: number;
  lossPercentage: number;
  avgLoss: number;
  expectedValue: number;
  riskRewardRatio: number;
}
