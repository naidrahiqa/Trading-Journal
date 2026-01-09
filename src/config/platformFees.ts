/**
 * Platform Fee Configuration Module - Synced with ListBroker.json
 * @description Centralized broker/platform fee structures
 * @version 4.0.0 - Updated 2026-01-09
 */

import { PlatformConfig, FeeStructure } from '@/types/trading';
import brokersData from '@/constants/ListBroker.json';

// ==================== LOGO MAPPING ====================

const platformLogos: Record<string, string> = {
  // Stocks Indonesia
  ajaib: '🟢',
  stockbit: '📊',
  ipot: '🔴',
  mirae: '🟠',
  mansek: '🔵',
  bions: '🟤',
  brights: '⚪',
  trima: '🟡',
  valbury: '🟡',
  
  // Crypto
  binance: '🟡',
  tokocrypto: '🔵',
  bybit: '🟠',
  indodax: '🟣',
  pintu: '🔵',
  mexc: '🔵',
  kucoin: '🟢',
  okx: '⚫',
  reku: '🔵',
  
  // Global Stocks
  gotrade: '🌐',
  ibkr: '🔷',
  
  // Forex
  exness: '🟡',
};

// ==================== GENERATE PLATFORMS FROM JSON ====================

export const ALL_PLATFORMS: PlatformConfig[] = brokersData.map((broker) => {
  // Map category to asset type
  const assetType = 
    broker.category === 'crypto' ? 'crypto' :
    broker.category === 'forex' ? 'crypto' : // Treat forex as crypto for simplicity
    'stock'; // stock, stock_global → stock

  // Create fee structure
  const fees: FeeStructure = {
    buy: broker.buyFee,
    sell: broker.sellFee,
    type: 
      broker.buyFee === 0 && broker.sellFee === 0 ? 'flat' :
      broker.id === 'gotrade' ? 'flat' :
      broker.id === 'ibkr' ? 'tiered' :
      'percentage',
    description: 
      broker.buyFee === 0 && broker.sellFee === 0 
        ? 'Free trading' 
        : broker.id === 'gotrade'
        ? `$${broker.buyFee} flat fee`
        : broker.id === 'ibkr'
        ? `${broker.buyFee}% per share (tiered)`
        : `${broker.buyFee}% buy, ${broker.sellFee}% sell`
  };

  return {
    id: broker.id as any, // Type assertion for Platform enum
    name: broker.name,
    logo: platformLogos[broker.id] || '💹',
    assetType: assetType as any,
    fees,
    color: broker.color,
  };
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Get platform configuration by ID
 */
export const getPlatformById = (platformId: string): PlatformConfig | undefined => {
  return ALL_PLATFORMS.find(p => p.id === platformId);
};

/**
 * Get platforms by asset type
 */
export const getPlatformsByAssetType = (assetType: 'crypto' | 'stock'): PlatformConfig[] => {
  return ALL_PLATFORMS.filter(p => p.assetType === assetType);
};

/**
 * Get platforms by category (for organized display)
 */
export const getPlatformsByCategory = () => {
  const brokers = brokersData;
  
  return {
    stock: brokers.filter(b => b.category === 'stock'),
    crypto: brokers.filter(b => b.category === 'crypto'),
    stock_global: brokers.filter(b => b.category === 'stock_global'),
    forex: brokers.filter(b => b.category === 'forex'),
  };
};

/**
 * Calculate fee amount based on platform configuration
 */
export const calculatePlatformFee = (
  platform: PlatformConfig,
  amount: number,
  isBuy: boolean,
  shares: number = 1
): number => {
  const feeConfig = isBuy ? platform.fees.buy : platform.fees.sell;
  
  if (typeof feeConfig === 'number') {
    // Check if it's percentage or flat
    if (platform.fees.type === 'flat') {
      // Flat fee (like Gotrade $1)
      return feeConfig;
    } else if (platform.fees.type === 'tiered') {
      // Tiered fee (like IBKR)
      const perShareFee = shares * (feeConfig / 100); // Convert to decimal
      const minFee = 1.00;
      const maxFee = amount * 0.01; // 1% max
      return Math.max(minFee, Math.min(perShareFee, maxFee));
    } else {
      // Percentage-based fee
      return (amount * feeConfig) / 100;
    }
  } else {
    // Function-based fee (for future custom calculations)
    return feeConfig(amount, shares);
  }
};

/**
 * Get total platforms count
 */
export const getTotalPlatformsCount = (): number => {
  return ALL_PLATFORMS.length;
};

/**
 * Get fee range for display
 */
export const getFeeRange = (platformId: string): string => {
  const broker = brokersData.find(b => b.id === platformId);
  if (!broker) return 'N/A';
  
  if (broker.buyFee === 0 && broker.sellFee === 0) {
    return 'FREE';
  }
  
  if (broker.id === 'gotrade') {
    return `$${broker.buyFee}`;
  }
  
  if (broker.buyFee === broker.sellFee) {
    return `${broker.buyFee}%`;
  }
  
  return `${broker.buyFee}% - ${broker.sellFee}%`;
};

// ==================== EXPORT DEFAULT ====================

export default {
  ALL_PLATFORMS,
  getPlatformById,
  getPlatformsByAssetType,
  getPlatformsByCategory,
  calculatePlatformFee,
  getTotalPlatformsCount,
  getFeeRange,
};
