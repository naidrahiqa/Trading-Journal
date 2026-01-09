# 🎯 COMPONENT ARCHITECTURE & FEATURE MAP

## 📊 Component Hierarchy

```
┌──────────────────────────────────────────────────────────────────┐
│                    src/app/page.tsx                               │
│                   (Entry Point + Auth)                            │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│              src/components/MainDashboard.tsx                     │
│          (Main Container with Tab Navigation)                     │
├──────────────────────┬───────────────────────┬────────────────────┤
│  Navigation Bar      │                       │    Logout          │
│  - Add Trade Tab     │                       │    Button          │
│  - Dashboard Tab     │                       │                    │
└──────────────────────┴───────────────────────┴────────────────────┘
           │                                   │
           │ (Tab: Add Trade)                  │ (Tab: Dashboard)
           ▼                                   ▼
┌────────────────────────────┐     ┌──────────────────────────────┐
│  TradingDashboard.tsx      │     │ EnhancedTradingSummary.tsx   │
│  (Add Trade Form)          │     │ (Dashboard with Filtering)   │
├────────────────────────────┤     ├──────────────────────────────┤
│ • Asset Type Toggle        │     │ • Timeframe Filter Tabs      │
│ • Platform Selection       │     │   - Hasil Barusan            │
│ • Asset Name Input         │     │   - 7 Hari, 1/3/4/12 Bulan   │
│ • Order Type (Long/Short)  │     │   - All Time                 │
│ • Entry/Exit Price         │     │                              │
│ • Quantity Input           │     │ • View Mode Toggle           │
│ • Notes (Optional)         │     │   - Minimalist               │
│ • Live PnL Preview         │     │   - Kece Abis                │
│ • Save Button              │     │                              │
└────────────────────────────┘     │ • Stats Cards (4)            │
                                   │   1. Total Net PnL           │
                                   │   2. Win Rate                │
                                   │   3. Total ROI               │
                                   │   4. Total Trades            │
                                   │                              │
                                   │ • Trade List/Grid            │
                                   │   ┌──────────────┐           │
                                   │   │ Minimalist   │           │
                                   │   │ (Table View) │           │
                                   │   └──────────────┘           │
                                   │   ┌──────────────┐           │
                                   │   │ Kece Abis    │           │
                                   │   │ (Card Grid)  │           │
                                   │   └──────────────┘           │
                                   └──────────────┬───────────────┘
                                                  │
                                   (Click Share Button)
                                                  │
                                                  ▼
                                   ┌──────────────────────────────┐
                                   │ ShareablePnLCard.tsx         │
                                   │ (Modal with Card Preview)    │
                                   ├──────────────────────────────┤
                                   │ • Glassmorphism Card         │
                                   │ • Asset + Platform Logos     │
                                   │ • Net PnL (Large Display)    │
                                   │ • ROI Badge                  │
                                   │ • Gradient Backgrounds       │
                                   │ • Share Button               │
                                   │ • Download Button            │
                                   └──────────────────────────────┘
```

---

## 🎨 FEATURE MAP

### 1️⃣ TIMEFRAME FILTERING

**Component:** `EnhancedTradingSummary.tsx`  
**Functions:** `filterTradesByTimeframe()`, `calculateStats()`  
**Library:** `date-fns` (subDays, subMonths, isAfter, parseISO)

```typescript
Timeframes Available:
├── Hasil Barusan → Last 1 trade (sorted by created_at DESC)
├── 7 Hari        → last 7 days
├── 1 Bulan       → last 30 days
├── 3 Bulan       → last 90 days
├── 4 Bulan       → last 120 days
├── 12 Bulan      → last 365 days
└── All Time      → No filtering

Stats Updated:
├── Total Net PnL
├── Win Rate (%)
├── Total ROI (%)
├── Total Trades Count
├── Winning/Losing Trades
└── Avg PnL per Trade
```

**How it works:**

1. User clicks a timeframe tab
2. `selectedTimeframe` state updates
3. `filteredTrades` useMemo recalculates
4. `calculateStats()` runs on filtered trades
5. UI re-renders with new values

---

### 2️⃣ SHAREABLE PnL CARDS

**Component:** `ShareablePnLCard.tsx`  
**Library:** `html2canvas` for image generation  
**API:** Web Share API (with fallback to download)

```typescript
Card Elements:
├── Header
│   ├── Asset Logo (emoji from platform config)
│   ├── Asset Name (e.g., "BTC/USDT")
│   └── Platform Logo + Name
├── Body
│   ├── Net PnL (6xl text, color-coded)
│   └── ROI Badge (rounded-full, color-coded)
├── Footer
│   ├── Timestamp (Indonesian format)
│   └── "Trading Journal" branding
└── Background
    ├── Glassmorphism overlay
    ├── Gradient backgrounds
    └── Decorative blur circles

Color Coding:
├── Profit  → Emerald-500 (#10b981)
└── Loss    → Rose-500 (#f43f5e)
```

**Share Flow:**

1. User clicks Share button (📤)
2. Modal opens with card preview
3. User chooses:
   - **Share** → `navigator.share()` or fallback to download
   - **Download** → Saves as PNG locally
4. `html2canvas()` generates 2x scale image
5. Blob created and converted to file/download link

**Trigger Points:**

- Individual trade card (in both view modes)
- Total Net PnL stats card (portfolio summary)

---

### 3️⃣ DUAL-MODE UI

**Component:** `EnhancedTradingSummary.tsx`  
**State:** `viewMode` ('minimalist' | 'kece_abis')  
**Subcomponents:** `MinimalistTradeList`, `KeceAbisTradeGrid`

#### 📋 Minimalist Mode

```
Table Layout:
┌────────┬──────────┬────────┬────────┬─────────┬──────┬─────────┐
│ Asset  │ Platform │ Entry  │ Exit   │ Net PnL │ ROI  │ Actions │
├────────┼──────────┼────────┼────────┼─────────┼──────┼─────────┤
│ BTC/   │ Binance  │ $45000 │ $47000 │ +$199.1 │ +4.4%│   📤    │
│ USDT   │          │        │        │         │      │         │
├────────┼──────────┼────────┼────────┼─────────┼──────┼─────────┤
│ ETH/   │ Binance  │ $3000  │ $2900  │ -$50.6  │ -1.7%│   📤    │
│ USDT   │          │        │        │         │      │         │
└────────┴──────────┴────────┴────────┴─────────┴──────┴─────────┘

Features:
├── Compact rows with hover effects
├── Platform logos in Asset column
├── Color-coded PnL and ROI
├── Share button per row
└── Sortable columns (future enhancement)
```

#### 🎨 Kece Abis Mode

```
Card Grid Layout (3 columns):
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ 🟡 BTC/USDT    │  │ 🟡 ETH/USDT    │  │ 📈 BBCA        │
│ Binance        │  │ Binance        │  │ Ajaib          │
│                │  │                │  │                │
│ 📈 +$199.10    │  │ 📉 -$50.60     │  │ 📈 +Rp249,125  │
│                │  │                │  │                │
│ [+4.42% ROI]   │  │ [-1.67% ROI]   │  │ [+49.8% ROI]   │
│                │  │                │  │                │
│ Entry: $45,000 │  │ Entry: $3,000  │  │ Entry: Rp8,500 │
│ Exit:  $47,000 │  │ Exit:  $2,900  │  │ Exit:  Rp9,000 │
│                │  │                │  │                │
│ 9 Jan 2026  📤 │  │ 2 Jan 2026  📤 │  │ 10 Des 2025 📤 │
└────────────────┘  └────────────────┘  └────────────────┘

Features:
├── Glassmorphism backgrounds
├── Gradient borders (profit = emerald, loss = rose)
├── Large PnL display with trend icons
├── ROI badges with color coding
├── Trade details in grid format
├── Hover animations (scale 1.02, lift -5px)
├── Share button per card
└── Decorative gradient overlays
```

**Toggle Button:**

```
┌──────────────────────────┐
│ [📝 Minimalist] [🎨 Kece Abis] │
└──────────────────────────┘
```

---

### 4️⃣ AUTOMATED FEE ENGINE

**Component:** `src/config/platformFees.ts`  
**Usage:** `TradingDashboard.tsx` (form), `calculatePnL()` utility

```typescript
Platform Configuration:
{
  id: 'binance',
  name: 'Binance',
  logo: '🟡',
  assetType: 'crypto',
  color: '#F3BA2F',
  fees: {
    buy: 0.1,     // 0.1%
    sell: 0.1,    // 0.1%
    type: 'percentage',
    description: '0.1% Taker/Maker'
  }
}

Fee Calculation:
Entry Amount = entryPrice × quantity
Exit Amount = exitPrice × quantity

Buy Fee = Entry Amount × (buy fee % / 100)
Sell Fee = Exit Amount × (sell fee % / 100)
Total Fee = Buy Fee + Sell Fee

Gross PnL:
├── Long:  (exitPrice - entryPrice) × quantity
└── Short: (entryPrice - exitPrice) × quantity

Net PnL = Gross PnL - Total Fee

ROI = (Net PnL / Entry Amount) × 100
```

**Supported Fee Types:**

1. **Percentage** - Most platforms (0.1%-0.3%)
2. **Flat** - Gotrade ($0.99-$1.99)
3. **Tiered** - Interactive Brokers ($0.005/share, min $1, max 1%)

---

## 🔄 DATA FLOW

### Adding a Trade:

```
User Input (Form)
    ↓
Validation (validateTradeInputs)
    ↓
Platform Fee Lookup (getPlatformById)
    ↓
PnL Calculation (calculatePnL)
    ↓
Live Preview (React State)
    ↓
User Clicks "Save"
    ↓
Supabase Insert (trading_logs)
    ↓
Success → Auto-switch to Dashboard
```

### Viewing Dashboard:

```
Component Mount
    ↓
Fetch Trades (Supabase Query)
    ↓
User Selects Timeframe
    ↓
Filter Trades (date-fns)
    ↓
Calculate Stats (useMemo)
    ↓
Render UI (conditional on viewMode)
    ↓
User Clicks Share
    ↓
Generate Card (html2canvas)
    ↓
Share/Download (Web Share API / Blob download)
```

---

## 📁 FILE ORGANIZATION

```
src/
├── app/
│   ├── page.tsx                      # Entry point with auth
│   ├── layout.tsx                    # Root layout
│   └── login/
│       └── page.tsx                  # Login page
│
├── components/
│   ├── MainDashboard.tsx             # Main container (NEW)
│   ├── TradingDashboard.tsx          # Add trade form
│   ├── TradingSummary.tsx            # Enhanced dashboard (REPLACED)
│   ├── ShareablePnLCard.tsx          # Share modal (NEW)
│   └── EmailAuth.tsx                 # Auth component
│
├── config/
│   └── platformFees.ts               # Fee engine
│
├── types/
│   └── trading.ts                    # Type definitions (EXTENDED)
│
└── utils/
    └── tradingCalculations.ts        # PnL calculations

migrations/
├── 001_create_trading_logs.sql       # Initial schema
└── 002_enhanced_features.sql         # Optional enhancements (NEW)

docs/
├── ADVANCED_FEATURES.md              # Feature documentation (NEW)
├── IMPLEMENTATION_GUIDE.md           # Setup guide (NEW)
└── V2_DELIVERY_SUMMARY.md            # This summary (NEW)
```

---

## 🎯 KEY FUNCTIONS

### Date Filtering (`TradingSummary.tsx`):

```typescript
const filterTradesByTimeframe = (
  trades: TradingLog[],
  timeframe: TimeframeFilter
): TradingLog[] => {
  if (timeframe === "all_time") return trades;
  if (timeframe === "last_trade") return [sorted[0]];

  const cutoffDate = subDays(new Date(), daysBack);
  return trades.filter((trade) =>
    isAfter(parseISO(trade.created_at), cutoffDate)
  );
};
```

### Stats Calculation (`TradingSummary.tsx`):

```typescript
const calculateStats = (trades: TradingLog[]) => {
  const winningTrades = trades.filter(t => t.net_pnl > 0).length;
  const totalNetPnL = trades.reduce((sum, t) => sum + t.net_pnl, 0);
  const winRate = (winningTrades / trades.length) * 100;

  return { totalTrades, winRate, totalNetPnL, ... };
};
```

### Share Handler (`TradingSummary.tsx`):

```typescript
const handleShareTradeCard = (trade: TradingLog) => {
  const platform = getPlatformById(trade.platform_id);
  const roi = (trade.net_pnl / (trade.entry_price * trade.quantity)) * 100;

  const cardData: ShareableCardData = {
    assetName: trade.asset_name,
    assetLogo: platform?.logo || "📈",
    platformName: platform?.name || trade.platform_id,
    platformLogo: platform?.logo || "💹",
    netPnL: trade.net_pnl,
    roi,
    assetType: trade.asset_type,
    timestamp: trade.created_at,
  };

  setShareCardData(cardData);
};
```

### Image Export (`ShareablePnLCard.tsx`):

```typescript
const handleDownload = async () => {
  const canvas = await html2canvas(cardRef.current, {
    backgroundColor: null,
    scale: 2,
    logging: false,
  });

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pnl-${data.assetName}-${Date.now()}.png`;
    link.click();
  });
};
```

---

## 🎨 DESIGN TOKENS

### Colors:

```css
/* Profit */
--emerald-400: #34d399
--emerald-500: #10b981
--cyan-400: #22d3ee
--cyan-500: #06b6d4

/* Loss */
--rose-400: #fb7185
--rose-500: #f43f5e
--pink-500: #ec4899

/* Backgrounds */
--slate-950: #020617
--slate-900: #0f172a
--slate-800: #1e293b
--slate-700: #334155

/* Accents */
--blue-500: #3b82f6
--purple-500: #a855f7
--orange-500: #f97316
```

### Typography:

```css
font-family: Inter, system-ui, sans-serif

/* Sizes */
text-xs:    0.75rem  (12px)
text-sm:    0.875rem (14px)
text-base:  1rem     (16px)
text-lg:    1.125rem (18px)
text-xl:    1.25rem  (20px)
text-2xl:   1.5rem   (24px)
text-3xl:   1.875rem (30px)
text-4xl:   2.25rem  (36px)
text-6xl:   3.75rem  (60px)

/* Weights */
font-medium:  500
font-semibold: 600
font-bold:    700
font-black:   900
```

### Spacing:

```css
p-2:  0.5rem  (8px)
p-4:  1rem    (16px)
p-6:  1.5rem  (24px)
p-8:  2rem    (32px)

gap-2: 0.5rem  (8px)
gap-3: 0.75rem (12px)
gap-4: 1rem    (16px)
gap-6: 1.5rem  (24px)
```

### Border Radius:

```css
rounded-lg:   0.5rem  (8px)
rounded-xl:   0.75rem (12px)
rounded-2xl:  1rem    (16px)
rounded-3xl:  1.5rem  (24px)
rounded-full: 9999px
```

---

## 🔧 DEPENDENCIES

### Production:

```json
{
  "@supabase/auth-helpers-nextjs": "^0.8.7", // Auth
  "@supabase/supabase-js": "^2.39.0", // Database
  "date-fns": "^4.1.0", // Date filtering ✨ NEW
  "framer-motion": "^10.16.16", // Animations
  "html2canvas": "^1.4.1", // Share cards ✨ NEW
  "lucide-react": "^0.294.0", // Icons
  "next": "^14.0.4", // Framework
  "react": "^18.2.0", // Core
  "tailwindcss": "^3.4.0", // Styling
  "typescript": "^5.3.3" // Type safety
}
```

---

## ✅ PRODUCTION CHECKLIST

- [x] All features implemented
- [x] TypeScript types complete
- [x] Dependencies installed
- [x] No database migration needed
- [x] Responsive design (mobile/tablet/desktop)
- [x] Animations optimized (60fps)
- [x] Error handling in place
- [x] Loading states implemented
- [x] Documentation comprehensive
- [x] Code commented
- [x] Environment variables documented
- [x] Build tested locally
- [x] Ready for Vercel deployment

---

**Version:** 2.0.0  
**Status:** ✅ Production Ready  
**Built:** January 9, 2026
