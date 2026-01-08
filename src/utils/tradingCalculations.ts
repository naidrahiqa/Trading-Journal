/**
 * Trading Calculations Utility
 * @description Core calculation logic for PnL, fees, and ROI
 */

import { PnLCalculation, FeeCalculation, OrderType, Platform } from '@/types/trading';
import { getPlatformById, calculatePlatformFee } from '@/config/platformFees';

// ==================== FEE CALCULATIONS ====================

/**
 * Calculate total fees for a trade
 * @param platformId Trading platform ID
 * @param entryPrice Entry price per unit
 * @param exitPrice Exit price per unit
 * @param quantity Number of units traded
 * @param orderType Long or Short trade
 * @returns Fee calculation breakdown
 */
export const calculateFees = (
  platformId: Platform,
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  orderType: OrderType = 'long'
): FeeCalculation => {
  const platform = getPlatformById(platformId);
  
  if (!platform) {
    console.warn(`Platform ${platformId} not found. Using 0% fees.`);
    return {
      buyFee: 0,
      sellFee: 0,
      totalFee: 0,
      breakdown: {
        buyPercentage: 0,
        sellPercentage: 0,
        buyAmount: 0,
        sellAmount: 0
      }
    };
  }

  const buyAmount = entryPrice * quantity;
  const sellAmount = exitPrice * quantity;

  // Calculate fees using platform configuration
  const buyFee = calculatePlatformFee(platform, buyAmount, true, quantity);
  const sellFee = calculatePlatformFee(platform, sellAmount, false, quantity);

  // Calculate percentages for display
  const buyPercentage = buyAmount > 0 ? (buyFee / buyAmount) * 100 : 0;
  const sellPercentage = sellAmount > 0 ? (sellFee / sellAmount) * 100 : 0;

  return {
    buyFee,
    sellFee,
    totalFee: buyFee + sellFee,
    breakdown: {
      buyPercentage,
      sellPercentage,
      buyAmount,
      sellAmount
    }
  };
};

// ==================== PnL CALCULATIONS ====================

/**
 * Calculate comprehensive PnL for a trade
 * @param entryPrice Entry price per unit
 * @param exitPrice Exit price per unit
 * @param quantity Number of units traded
 * @param platformId Trading platform ID
 * @param orderType Long or Short trade
 * @returns Complete PnL calculation with fees and ROI
 */
export const calculatePnL = (
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  platformId: Platform,
  orderType: OrderType = 'long'
): PnLCalculation => {
  // Input validation
  if (entryPrice <= 0 || exitPrice <= 0 || quantity <= 0) {
    return {
      grossPnL: 0,
      fees: {
        buyFee: 0,
        sellFee: 0,
        totalFee: 0,
        breakdown: {
          buyPercentage: 0,
          sellPercentage: 0,
          buyAmount: 0,
          sellAmount: 0
        }
      },
      netPnL: 0,
      roi: 0,
      totalValue: 0,
      profitLoss: 'neutral'
    };
  }

  // Calculate gross P&L based on order type
  let grossPnL: number;
  
  if (orderType === 'long') {
    // Long: Buy low, sell high
    grossPnL = (exitPrice - entryPrice) * quantity;
  } else {
    // Short: Sell high, buy low
    grossPnL = (entryPrice - exitPrice) * quantity;
  }

  // Calculate fees
  const fees = calculateFees(platformId, entryPrice, exitPrice, quantity, orderType);

  // Calculate net P&L (gross - fees)
  const netPnL = grossPnL - fees.totalFee;

  // Calculate total investment value
  const totalValue = entryPrice * quantity;

  // Calculate ROI percentage (based on entry value)
  // ROI = (Net PnL / Initial Investment) * 100
  const roi = totalValue > 0 ? (netPnL / totalValue) * 100 : 0;

  // Determine profit/loss status
  let profitLoss: 'profit' | 'loss' | 'neutral';
  if (netPnL > 0) profitLoss = 'profit';
  else if (netPnL < 0) profitLoss = 'loss';
  else profitLoss = 'neutral';

  return {
    grossPnL,
    fees,
    netPnL,
    roi,
    totalValue,
    profitLoss
  };
};

// ==================== FORMATTING UTILITIES ====================

/**
 * Format currency with proper decimals
 * Auto-selects currency based on asset type:
 * - Crypto → USD
 * - Stock → IDR
 * @param value Number to format
 * @param assetType Asset type ('crypto' or 'stock')
 * @param currency Override currency (optional)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number,
  assetType?: 'crypto' | 'stock',
  currency?: string
): string => {
  if (isNaN(value)) return '$0.00';
  
  // Auto-select currency based on asset type
  let selectedCurrency = currency;
  let decimals = 2;
  let locale = 'en-US';
  
  if (!selectedCurrency && assetType) {
    if (assetType === 'crypto') {
      selectedCurrency = 'USD';
      decimals = 2;
      locale = 'en-US';
    } else if (assetType === 'stock') {
      selectedCurrency = 'IDR';
      decimals = 0; // IDR typically doesn't use decimals
      locale = 'id-ID';
    }
  }
  
  // Default to USD if no asset type provided
  if (!selectedCurrency) {
    selectedCurrency = 'USD';
    decimals = 2;
    locale = 'en-US';
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: selectedCurrency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Format percentage with sign
 * @param value Percentage value
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  if (isNaN(value)) return '0.00%';
  
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

/**
 * Get color class based on profit/loss
 * @param value Number to evaluate
 * @returns Tailwind color class
 */
export const getPnLColorClass = (value: number): string => {
  if (value > 0) return 'text-emerald-500';
  if (value < 0) return 'text-rose-500';
  return 'text-slate-400';
};

/**
 * Get background color class based on profit/loss
 * @param value Number to evaluate
 * @returns Tailwind background color class
 */
export const getPnLBgClass = (value: number): string => {
  if (value > 0) return 'bg-emerald-500/10 border-emerald-500/20';
  if (value < 0) return 'bg-rose-500/10 border-rose-500/20';
  return 'bg-slate-500/10 border-slate-500/20';
};

// ==================== VALIDATION UTILITIES ====================

/**
 * Validate trade input values
 * @param entryPrice Entry price
 * @param exitPrice Exit price
 * @param quantity Quantity
 * @returns Validation result
 */
export const validateTradeInputs = (
  entryPrice: number,
  exitPrice: number,
  quantity: number
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (entryPrice <= 0) {
    errors.push('Entry price must be greater than 0');
  }

  if (exitPrice <= 0) {
    errors.push('Exit price must be greater than 0');
  }

  if (quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  if (isNaN(entryPrice) || !isFinite(entryPrice)) {
    errors.push('Entry price must be a valid number');
  }

  if (isNaN(exitPrice) || !isFinite(exitPrice)) {
    errors.push('Exit price must be a valid number');
  }

  if (isNaN(quantity) || !isFinite(quantity)) {
    errors.push('Quantity must be a valid number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ==================== EXPORT ALL ====================

export default {
  calculateFees,
  calculatePnL,
  formatCurrency,
  formatPercentage,
  getPnLColorClass,
  getPnLBgClass,
  validateTradeInputs
};
