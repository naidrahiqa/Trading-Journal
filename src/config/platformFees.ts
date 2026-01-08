/**
 * Platform Fee Configuration Module
 * @description 2026 Updated fee structures for all supported trading platforms
 * @version 1.0.0
 */

import { PlatformConfig, FeeStructure } from '@/types/trading';

// ==================== FEE CALCULATION HELPERS ====================

/**
 * Interactive Brokers Tiered Fee Structure (Simplified IBKR Tiered)
 * For stocks: USD 0.005 per share, min $1.00, max 1% of trade value
 */
const interactiveBrokersFee = (amount: number, shares: number = 1): number => {
  const perShareFee = shares * 0.005;
  const minFee = 1.00;
  const maxFee = amount * 0.01; // 1% max
  
  return Math.max(minFee, Math.min(perShareFee, maxFee));
};

/**
 * Gotrade Fee Structure (Simplified)
 * $0.99 for trades < $1000, $1.99 for trades >= $1000
 */
const gotradeFee = (amount: number): number => {
  return amount < 1000 ? 0.99 : 1.99;
};

// ==================== STOCK PLATFORMS ====================

const stockPlatforms: PlatformConfig[] = [
  {
    id: 'ajaib',
    name: 'Ajaib',
    logo: '🟢',
    assetType: 'stock',
    color: '#00D09C',
    fees: {
      buy: 0.15,   // 0.15%
      sell: 0.25,  // 0.25%
      type: 'percentage',
      description: 'Buy 0.15% | Sell 0.25%'
    }
  },
  {
    id: 'stockbit',
    name: 'Stockbit',
    logo: '📊',
    assetType: 'stock',
    color: '#0066FF',
    fees: {
      buy: 0.15,   // 0.15%
      sell: 0.25,  // 0.25%
      type: 'percentage',
      description: 'Buy 0.15% | Sell 0.25%'
    }
  },
  {
    id: 'ipot',
    name: 'IPOT',
    logo: '📈',
    assetType: 'stock',
    color: '#FF6B00',
    fees: {
      buy: 0.19,   // 0.19%
      sell: 0.29,  // 0.29%
      type: 'percentage',
      description: 'Buy 0.19% | Sell 0.29%'
    }
  },
  {
    id: 'mirae',
    name: 'Mirae Asset',
    logo: '🏛️',
    assetType: 'stock',
    color: '#003087',
    fees: {
      buy: 0.15,   // 0.15%
      sell: 0.25,  // 0.25%
      type: 'percentage',
      description: 'Buy 0.15% | Sell 0.25%'
    }
  },
  {
    id: 'gotrade',
    name: 'Gotrade',
    logo: '🌐',
    assetType: 'stock',
    color: '#7C3AED',
    fees: {
      buy: gotradeFee,
      sell: gotradeFee,
      type: 'flat',
      description: '$0.99 - $1.99 per trade'
    }
  },
  {
    id: 'interactive_brokers',
    name: 'Interactive Brokers',
    logo: '🔷',
    assetType: 'stock',
    color: '#DA291C',
    fees: {
      buy: interactiveBrokersFee,
      sell: interactiveBrokersFee,
      type: 'tiered',
      description: '$0.005/share | Min $1 | Max 1%'
    }
  }
];

// ==================== CRYPTO PLATFORMS ====================

const cryptoPlatforms: PlatformConfig[] = [
  {
    id: 'binance',
    name: 'Binance',
    logo: '🟡',
    assetType: 'crypto',
    color: '#F3BA2F',
    fees: {
      buy: 0.1,    // 0.1%
      sell: 0.1,   // 0.1%
      type: 'percentage',
      description: '0.1% Taker/Maker'
    }
  },
  {
    id: 'bybit',
    name: 'Bybit',
    logo: '🟠',
    assetType: 'crypto',
    color: '#F7A600',
    fees: {
      buy: 0.1,    // 0.1%
      sell: 0.1,   // 0.1%
      type: 'percentage',
      description: '0.1% Standard Fee'
    }
  },
  {
    id: 'tokocrypto',
    name: 'Tokocrypto',
    logo: '🔵',
    assetType: 'crypto',
    color: '#2A52BE',
    fees: {
      buy: 0.1,    // 0.1%
      sell: 0.1,   // 0.1%
      type: 'percentage',
      description: '0.1% Trading Fee'
    }
  },
  {
    id: 'indodax',
    name: 'Indodax',
    logo: '🟣',
    assetType: 'crypto',
    color: '#6366F1',
    fees: {
      buy: 0.21,   // 0.21%
      sell: 0.21,  // 0.21%
      type: 'percentage',
      description: '0.21% Trading Fee'
    }
  },
  {
    id: 'okx',
    name: 'OKX',
    logo: '⚫',
    assetType: 'crypto',
    color: '#000000',
    fees: {
      buy: 0.1,    // 0.1% (Simplified)
      sell: 0.1,   // 0.1%
      type: 'percentage',
      description: '0.1% Taker Fee'
    }
  },
  {
    id: 'reku',
    name: 'Reku',
    logo: '🟢',
    assetType: 'crypto',
    color: '#10B981',
    fees: {
      buy: 0.15,   // 0.15%
      sell: 0.15,  // 0.15%
      type: 'percentage',
      description: '0.15% Trading Fee'
    }
  },
  {
    id: 'pintu',
    name: 'Pintu',
    logo: '🟡',
    assetType: 'crypto',
    color: '#FCD34D',
    fees: {
      buy: 0.15,   // 0.15%
      sell: 0.15,  // 0.15%
      type: 'percentage',
      description: '0.15% Trading Fee'
    }
  }
];

// ==================== COMBINED PLATFORM CONFIG ====================

export const ALL_PLATFORMS: PlatformConfig[] = [
  ...stockPlatforms,
  ...cryptoPlatforms
];

// ==================== PLATFORM LOOKUP FUNCTIONS ====================

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
 * Calculate fee amount based on platform configuration
 * @param platform Platform configuration
 * @param amount Transaction amount in base currency
 * @param isBuy Whether this is a buy transaction
 * @param shares Optional: number of shares (for tiered pricing)
 * @returns Fee amount
 */
export const calculatePlatformFee = (
  platform: PlatformConfig,
  amount: number,
  isBuy: boolean,
  shares: number = 1
): number => {
  const feeConfig = isBuy ? platform.fees.buy : platform.fees.sell;
  
  if (typeof feeConfig === 'number') {
    // Percentage-based fee
    return (amount * feeConfig) / 100;
  } else {
    // Function-based fee (flat or tiered)
    return feeConfig(amount, shares);
  }
};

// ==================== EXPORT DEFAULT ====================

export default {
  ALL_PLATFORMS,
  getPlatformById,
  getPlatformsByAssetType,
  calculatePlatformFee
};
