/**
 * Logo Utilities - Auto-detect crypto, stock, and broker logos
 * @description Multiple API fallbacks + generated avatars
 * @version 2.0.0
 */

// ==================== CRYPTO LOGO APIS ====================

const CRYPTO_LOGO_APIS = [
  // CoinGecko - Most reliable
  (symbol: string) => `https://assets.coingecko.com/coins/images/1/${symbol.toLowerCase()}.png`,
  
  // CryptoCompare - Good fallback
  (symbol: string) => `https://www.cryptocompare.com/media/37746251/${symbol.toLowerCase()}.png`,
  
  // Alternative: Use CoinMarketCap style
  (symbol: string) => `https://s2.coinmarketcap.com/static/img/coins/64x64/${getCryptoId(symbol)}.png`,
];

// Map common crypto symbols to IDs
function getCryptoId(symbol: string): string {
  const mapping: Record<string, string> = {
    'btc': '1',
    'eth': '1027',
    'bnb': '1839',
    'usdt': '825',
    'usdc': '3408',
    'xrp': '52',
    'ada': '2010',
    'doge': '74',
    'sol': '5426',
    'dot': '6636',
    'matic': '3890',
    'uni': '7083',
    'link': '1975',
    'avax': '5805',
    'atom': '3794',
  };
  return mapping[symbol.toLowerCase()] || '1';
}

// ==================== GET CRYPTO LOGO ====================

export async function getCryptoLogo(assetName: string): Promise<string> {
  const symbol = assetName.split('/')[0].toLowerCase(); // BTC/USDT -> btc
  
  // Try each API in order
  for (const getUrl of CRYPTO_LOGO_APIS) {
    try {
      const url = getUrl(symbol);
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        return url;
      }
    } catch (error) {
      // Continue to next API
      continue;
    }
  }
  
  // All APIs failed, return generated avatar
  return generateCryptoAvatar(symbol);
}

// ==================== GENERATE CRYPTO AVATAR ====================

export function generateCryptoAvatar(symbol: string): string {
  // Create data URL for SVG avatar
  const letter = symbol.charAt(0).toUpperCase();
  const colors = [
    { bg: '#F7931A', text: '#FFFFFF' }, // Bitcoin orange
    { bg: '#627EEA', text: '#FFFFFF' }, // Ethereum blue
    { bg: '#F3BA2F', text: '#000000' }, // Binance yellow
    { bg: '#26A17B', text: '#FFFFFF' }, // Tether green
    { bg: '#2775CA', text: '#FFFFFF' }, // USDC blue
  ];
  
  const colorIndex = symbol.charCodeAt(0) % colors.length;
  const color = colors[colorIndex];
  
  const svg = `
    <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="12" fill="${color.bg}"/>
      <text x="40" y="40" text-anchor="middle" dy="0.35em" 
            font-family="Arial, sans-serif" font-size="36" font-weight="bold" 
            fill="${color.text}">${letter}</text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// ==================== STOCK LOGO DETECTION ====================

export async function getStockLogo(ticker: string, exchange: string = 'IDX'): Promise<string> {
  const cleanTicker = ticker.toUpperCase().trim();
  
  // Try Clearbit Logo API (works for US stocks)
  if (exchange === 'US' || exchange === 'NASDAQ' || exchange === 'NYSE') {
    try {
      const domain = getCompanyDomain(cleanTicker);
      if (domain) {
        const url = `https://logo.clearbit.com/${domain}`;
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          return url;
        }
      }
    } catch (error) {
      // Continue to fallback
    }
  }
  
  // Fallback: Generate avatar
  return generateStockAvatar(cleanTicker);
}

// Map stock tickers to domains (for US stocks)
function getCompanyDomain(ticker: string): string | null {
  const domains: Record<string, string> = {
    'AAPL': 'apple.com',
    'MSFT': 'microsoft.com',
    'GOOGL': 'google.com',
    'GOOG': 'google.com',
    'AMZN': 'amazon.com',
    'TSLA': 'tesla.com',
    'META': 'meta.com',
    'NVDA': 'nvidia.com',
    'JPM': 'jpmorganchase.com',
    'V': 'visa.com',
    'WMT': 'walmart.com',
    'DIS': 'disney.com',
    'NFLX': 'netflix.com',
    'ADBE': 'adobe.com',
    'CRM': 'salesforce.com',
    // Add more as needed
  };
  
  return domains[ticker] || null;
}

// ==================== GENERATE STOCK AVATAR ====================

export function generateStockAvatar(ticker: string): string {
  const letter = ticker.charAt(0);
  const colors = [
    { bg: '#1E3A8A', text: '#FFFFFF' }, // Deep blue
    { bg: '#7C3AED', text: '#FFFFFF' }, // Purple
    { bg: '#059669', text: '#FFFFFF' }, // Green
    { bg: '#DC2626', text: '#FFFFFF' }, // Red
    { bg: '#D97706', text: '#FFFFFF' }, // Orange
    { bg: '#4F46E5', text: '#FFFFFF' }, // Indigo
  ];
  
  const colorIndex = letter.charCodeAt(0) % colors.length;
  const color = colors[colorIndex];
  
  const svg = `
    <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad${ticker}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color.bg}dd;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="16" fill="url(#grad${ticker})"/>
      <text x="40" y="40" text-anchor="middle" dy="0.35em" 
            font-family="Arial, sans-serif" font-size="32" font-weight="bold" 
            fill="${color.text}">${letter}</text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// ==================== BROKER LOGO DETECTION ====================

export function getBrokerLogo(brokerId: string): string {
  // Platform logos mapping (emoji fallback if no real logo)
  const brokerLogos: Record<string, string> = {
    // Crypto
    'binance': '🟡',
    'bybit': '🟠',
    'tokocrypto': '🔵',
    'indodax': '🟣',
    'pintu': '🔵',
    'okx': '⚫',
    'reku': '🔵',
    'mexc': '🔵',
    'kucoin': '🟢',
    
    // Stocks
    'ajaib': '🟢',
    'stockbit': '📊',
    'ipot': '🔴',
    'mirae': '🟠',
    'mansek': '🔵',
    'bions': '🟤',
    'brights': '⚪',
    'trima': '🟡',
    'valbury': '🟡',
    
    // Global
    'gotrade': '🌐',
    'ibkr': '🔷',
    'interactive_brokers': '🔷',
    
    // Forex
    'exness': '🟡',
  };
  
  return brokerLogos[brokerId.toLowerCase()] || '💹';
}

// You could also try to fetch real broker logos from their websites:
export async function getBrokerLogoUrl(brokerId: string): Promise<string> {
  const brokerDomains: Record<string, string> = {
    'binance': 'binance.com',
    'bybit': 'bybit.com',
    'ajaib': 'ajaib.co.id',
    'stockbit': 'stockbit.com',
    'ipot': 'ipot.co.id',
    // etc.
  };
  
  const domain = brokerDomains[brokerId.toLowerCase()];
  if (domain) {
    try {
      // Try Clearbit
      const url = `https://logo.clearbit.com/${domain}`;
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        return url;
      }
    } catch (error) {
      // Fallback to Google favicon
      try {
        const url = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        return url;
      } catch {
        // Return emoji fallback
        return getBrokerLogo(brokerId);
      }
    }
  }
  
  return getBrokerLogo(brokerId);
}

// ==================== UNIFIED LOGO GETTER ====================

export async function getAssetLogo(
  assetName: string,
  assetType: 'crypto' | 'stock',
  exchange?: string
): Promise<string> {
  if (assetType === 'crypto') {
    return await getCryptoLogo(assetName);
  } else {
    return await getStockLogo(assetName, exchange);
  }
}

// ==================== EXPORT ====================

export default {
  getCryptoLogo,
  getStockLogo,
  getBrokerLogo,
  getBrokerLogoUrl,
  getAssetLogo,
  generateCryptoAvatar,
  generateStockAvatar,
};
