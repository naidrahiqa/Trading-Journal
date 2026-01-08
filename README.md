# 📊 Advanced Trading Journal & Portfolio Tracker

A premium, production-ready trading journal application built with **Next.js 14**, **TypeScript**, **Supabase**, and **Tailwind CSS**. Features automated fee calculation for 13+ trading platforms, real-time P&L preview, and a stunning dark-mode financial dashboard UI.

---

## ✨ Features

### 🎯 Core Functionality

- ✅ **Manual Trade Entry** - Record both crypto and stock trades
- ✅ **Automated Fee Calculation** - Smart fee engine for 13+ platforms
- ✅ **Live P&L Preview** - Real-time calculations as you type
- ✅ **Long & Short Positions** - Support for both trade types
- ✅ **ROI Tracking** - Instant return on investment calculations
- ✅ **User Authentication** - Secure with Supabase Auth + RLS

### 🎨 Premium UI/UX

- 🌙 **Modern Dark Mode** - Slate-900/950 professional theme
- 🎭 **Framer Motion Animations** - Smooth, polished interactions
- 📱 **Fully Responsive** - Mobile-first design
- 🎨 **Financial Color Scheme** - Emerald for profits, Rose for losses
- 🔄 **Platform Chips** - Horizontal scrollable platform selector with brand logos
- 📊 **Floating Summary Card** - Live P&L breakdown with fee transparency

### 💼 Supported Platforms

#### 📈 Stock Platforms (6)

| Platform                | Buy Fee      | Sell Fee     | Type       |
| ----------------------- | ------------ | ------------ | ---------- |
| **Ajaib**               | 0.15%        | 0.25%        | Percentage |
| **Stockbit**            | 0.15%        | 0.25%        | Percentage |
| **IPOT**                | 0.19%        | 0.29%        | Percentage |
| **Mirae Asset**         | 0.15%        | 0.25%        | Percentage |
| **Gotrade**             | $0.99-$1.99  | $0.99-$1.99  | Flat Fee   |
| **Interactive Brokers** | $0.005/share | $0.005/share | Tiered     |

#### 💰 Crypto Platforms (7)

| Platform       | Trading Fee | Type        |
| -------------- | ----------- | ----------- |
| **Binance**    | 0.1%        | Taker/Maker |
| **Bybit**      | 0.1%        | Standard    |
| **Tokocrypto** | 0.1%        | Standard    |
| **Indodax**    | 0.21%       | Standard    |
| **OKX**        | 0.1%        | Taker       |
| **Reku**       | 0.15%       | Standard    |
| **Pintu**      | 0.15%       | Standard    |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn** or **pnpm**
- **Supabase Account** (free tier works!)

### 1️⃣ Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd jurnal-trading-ku

# Install dependencies
npm install
```

### 2️⃣ Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3️⃣ Database Migration

1. Go to your **Supabase Dashboard** → SQL Editor
2. Open `migrations/001_create_trading_logs.sql`
3. Copy and paste the entire script
4. Click **Run** to execute the migration

This will create:

- `trading_logs` table with proper schema
- Row Level Security (RLS) policies
- Indexes for performance
- `trading_stats` view for analytics
- Auto-update triggers

### 4️⃣ Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📦 Dependencies

### Required Packages

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0",
    "@supabase/supabase-js": "^2.38.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.294.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

Install missing packages:

```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js framer-motion lucide-react
```

---

## 🏗️ Project Structure

```
jurnal-trading-ku/
├── src/
│   ├── components/
│   │   └── TradingDashboard.tsx      # Main dashboard component
│   ├── config/
│   │   └── platformFees.ts           # Fee configuration for all platforms
│   ├── types/
│   │   └── trading.ts                # TypeScript type definitions
│   └── utils/
│       └── tradingCalculations.ts    # P&L calculation utilities
├── migrations/
│   └── 001_create_trading_logs.sql   # Supabase database schema
├── .env.local                        # Environment variables (create this)
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 🧮 How Fee Calculation Works

The app automatically calculates fees based on the selected platform:

### Example: Binance (Crypto)

```typescript
Entry: $50,000 × 100 BTC = $5,000,000
Buy Fee: 0.1% = $5,000

Exit: $51,000 × 100 BTC = $5,100,000
Sell Fee: 0.1% = $5,100

Gross P&L: $100,000
Total Fees: $10,100
Net P&L: $89,900
ROI: 1.80%
```

### Example: Ajaib (Stock)

```typescript
Entry: Rp 4,500 × 10,000 shares = Rp 45,000,000
Buy Fee: 0.15% = Rp 67,500

Exit: Rp 5,000 × 10,000 shares = Rp 50,000,000
Sell Fee: 0.25% = Rp 125,000

Gross P&L: Rp 5,000,000
Total Fees: Rp 192,500
Net P&L: Rp 4,807,500
ROI: 10.68%
```

---

## 🔐 Security Features

### Row Level Security (RLS)

All trading logs are protected with Supabase RLS:

- ✅ Users can only view **their own** trades
- ✅ Users can only insert/update/delete **their own** trades
- ✅ No user can access another user's data

### Authentication Required

The dashboard requires users to be authenticated via Supabase Auth before saving trades.

---

## 🎨 UI Components Breakdown

### 1. Asset Type Toggle

Animated switch between **Crypto** and **Stocks** modes with gradient backgrounds.

### 2. Platform Selector

Horizontal scrollable chips featuring:

- Platform emoji/logo
- Platform name
- Fee description
- Active state with emerald glow

### 3. Order Type Toggle

Visual buttons for **Long (Buy)** vs **Short (Sell)** with directional arrow icons.

### 4. Live Preview Card

Real-time calculations displaying:

- Net P&L with trend icon
- ROI percentage
- Gross P&L breakdown
- Buy/Sell fee itemization
- Total investment value

### 5. Form Validation

Instant feedback with:

- Visual error states
- Toast notifications
- Success animations

---

## 📊 Using the Dashboard

### Step-by-Step Guide

1. **Select Asset Type** - Toggle between Crypto or Stocks
2. **Choose Platform** - Click on your trading platform chip
3. **Enter Asset Name** - E.g., "BTC/USDT" or "AAPL"
4. **Select Order Type** - Long (buy low, sell high) or Short
5. **Input Trade Details**:
   - Entry Price
   - Exit Price
   - Quantity
6. **Add Notes** (Optional) - Trade rationale or strategy
7. **Review Live Preview** - Check calculated P&L and fees
8. **Save Trade** - Submit to database

---

## 🛠️ Customization

### Adding New Platforms

Edit `src/config/platformFees.ts`:

```typescript
{
  id: 'new_platform',
  name: 'New Platform',
  logo: '🆕',
  assetType: 'crypto', // or 'stock'
  color: '#FF5733',
  fees: {
    buy: 0.2,    // 0.2%
    sell: 0.2,   // 0.2%
    type: 'percentage',
    description: '0.2% Trading Fee'
  }
}
```

### Modifying Fee Logic

For complex fee structures (tiered, volume-based), use functions:

```typescript
const customFee = (amount: number, volume: number): number => {
  if (volume < 1000) return amount * 0.003; // 0.3%
  if (volume < 10000) return amount * 0.002; // 0.2%
  return amount * 0.001; // 0.1%
};
```

---

## 🔮 Future Enhancements

- [ ] **Trade History Table** with pagination
- [ ] **Analytics Dashboard** with charts (win rate, P&L trends)
- [ ] **Export to CSV/Excel**
- [ ] **Multi-currency support** (IDR, EUR, etc.)
- [ ] **Trade filtering** by date range, platform, asset type
- [ ] **Performance metrics** (Sharpe ratio, max drawdown)
- [ ] **Mobile app** with React Native

---

## 🐛 Troubleshooting

### Issue: "Invalid API Key" Error

**Solution**: Double-check your `.env.local` file has correct Supabase credentials.

### Issue: RLS Policy Blocking Inserts

**Solution**: Ensure user is authenticated before submitting trades:

```typescript
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) throw new Error("Not authenticated");
```

### Issue: Calculation Shows NaN

**Solution**: Ensure all numeric inputs are valid numbers > 0.

---

## 📄 License

MIT License - feel free to use this in your projects!

---

## 🙏 Credits

- **UI Design Inspiration**: Modern fintech dashboards (Robinhood, Webull)
- **Icons**: [Lucide Icons](https://lucide.dev)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Database**: [Supabase](https://supabase.com)

---

## 📧 Support

For issues, questions, or feature requests, please open an issue on GitHub.

**Happy Trading! 📈💰**
