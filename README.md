# 📊 Ultimate Trading Journal v3.0.0

<div align="center">

**Track, Analyze, and Master Your Trading Psychology** 🧠📈

Production-grade trading journal with **Psychology Tags**, **Mistake Cost Analysis**, **Trading Hours Optimization**, and **Expected Value Calculation**.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)

[Quick Start](#-quick-start) • [Features](#-features) • [Demo](#-demo) • [Docs](#-documentation)

</div>

---

## ✨ **What's New in v3.0.0**

🧠 **Psychology Tags** - Track FOMO, Discipline, Revenge Trading  
📊 **Mistake Cost Widget** - See how much emotional trading costs you  
⏰ **Trading Hours Analytics** - Find your best performing hours  
💰 **Expected Value (EV)** - Know if your strategy is profitable long-term

[See Full Changelog →](V3_WHATS \_NEW.md)

---

## 🎯 **Features**

<table>
<tr>
<td width="50%">

### **Core Features**

- ✅ Add trades (Crypto & Stocks)
- ✅ Automated fee calculation (14+ platforms)
- ✅ Live PnL preview
- ✅ Real-time ROI calculation
- ✅ Supabase authentication
- ✅ Row-level security (RLS)

</td>
<td>

### **Advanced Analytics** ⭐

- ✨ **Psychology tags** (12 tags)
- ✨ **Mistake cost analysis**
- ✨ **Trading hours stats**
- ✨ **Expected value (EV)**
- ✅ Timeframe filtering (7 options)
- ✅ Win rate tracking

</td>
</tr>
<tr>
<td>

### **User Experience**

- ✅ Dual-mode UI (Minimalist/Kece Abis)
- ✅ Shareable PnL cards
- ✅ Dark mode design
- ✅ Responsive (mobile-ready)
- ✅ Smooth animations (Framer Motion)
- ✅ Real-time updates

</td>
<td>

### **Platforms Supported**

**Crypto:** Binance, Bybit, Tokocrypto, Indodax, OKX, Reku, Pintu

**Stocks:** Ajaib, Stockbit, IPOT, Mirae Asset, Gotrade, Interactive Brokers

</td>
</tr>
</table>

---

## 🚀 **Quick Start**

### **1. Clone & Install**

```bash
git clone https://github.com/naidrahiqa/trading-journal.git
cd trading-journal
npm install
```

### **2. Setup Supabase**

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations:
   - `migrations/001_create_trading_logs.sql` (Required)
   - `migrations/003_psychology_tags.sql` (For psychology features)
3. Get your API keys from Settings → API

### **3. Environment Variables**

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### **4. Run Development Server**

```bash
npm run dev
```

Visit: **http://localhost:3000** 🎉

---

## 🧠 **Psychology Tags**

Track the psychology behind every trade:

| Category             | Tags                                                  |
| -------------------- | ----------------------------------------------------- |
| **Positive** (Green) | 🎯 Disciplined, 📋 Planned, ⏳ Patient, 📊 Analytical |
| **Negative** (Red)   | 😱 FOMO, 😤 Revenge, 🤑 Greed, 😨 Fear, ⚡ Impulsive  |
| **Neutral**          | 🤔 Cautious                                           |

**Mistake Cost Analysis** shows you exactly how much FOMO and Revenge Trading are costing you! 💸

---

## 📊 **Analytics Dashboard**

### **Mistake Cost Widget**

```
⚠️ Mistake Cost Analysis  [5 mistakes]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Cost: -$1,234.56
💡 You could have saved $1,234.56 with discipline

😱 FOMO: 3 trades → -$800
😤 Revenge: 2 trades → -$434.56

🎯 Disciplined: 10 trades | 80% win → +$2,345
```

### **Trading Hours**

```
Your Best Hours:
1. 09:00-10:00 │ Win Rate: 75% │ +$500 ✅
2. 14:00-15:00 │ Win Rate: 70% │ +$350 ✅

Your Worst Hours:
1. 23:00-00:00 │ Win Rate: 20% │ -$450 ❌
```

### **Expected Value**

```
Strategy EV: +$58 per trade ✅
Win Rate: 60% | Avg Win: $150 | Avg Loss: -$80
```

If EV > 0 → Keep executing! 🚀

---

## 🎨 **UI Modes**

### **Minimalist Mode** - Clean data table

| Asset    | Platform | P&L   | ROI   | Tags |
| -------- | -------- | ----- | ----- | ---- |
| BTC/USDT | Binance  | +$199 | +4.4% | 🎯📋 |

### **Kece Abis Mode** - Rich animated cards

- Glassmorphism backgrounds
- Platform logos
- Large PnL displays
- Psychology tag chips
- Hover animations

---

## 📁 **Project Structure**

```
src/
├── app/                    # Next.js pages
├── components/
│   ├── MainDashboard.tsx          # Main container
│   ├── TradingDashboard.tsx       # Add trade form
│   ├── TradingSummary.tsx         # Dashboard with filtering
│   ├── ShareablePnLCard.tsx      # Social share cards
│   └── MistakeCostWidget.tsx     # ✨ Mistake analysis
├── config/
│   ├── platformFees.ts           # Fee calculations
│   └── psychologyTags.ts         # ✨ Tag definitions
├── types/trading.ts              # TypeScript types
└── utils/tradingCalculations.ts  # PnL logic

migrations/
├── 001_create_trading_logs.sql   # Initial schema
├── 002_enhanced_features.sql     # Optional indexes
└── 003_psychology_tags.sql       # ✨ Psychology features
```

---

## 🗄️ **Database Schema**

```sql
CREATE TABLE trading_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users,

    asset_name TEXT,
    asset_type TEXT, -- 'crypto' or 'stock'
    platform_id TEXT,

    order_type TEXT, -- 'long' or 'short'
    entry_price NUMERIC,
    exit_price NUMERIC,
    quantity NUMERIC,

    gross_pnl NUMERIC,
    total_fee NUMERIC,
    net_pnl NUMERIC,

    tags TEXT[],  -- ✨ Psychology tags
    notes TEXT,

    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

---

## 🔧 **Tech Stack**

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.3
- **Styling:** Tailwind CSS 3.4
- **Animation:** Framer Motion
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Date Utils:** date-fns
- **Image Export:** html2canvas
- **Icons:** Lucide React

---

## 📚 **Documentation**

- **[Ultimate Guide](ULTIMATE_GUIDE.md)** - Complete v3.0 documentation
- **[What's New](V3_WHATS_NEW.md)** - v3.0 changelog
- **[Quick Start](QUICKSTART.md)** - Setup guide
- **[Architecture](ARCHITECTURE.md)** - Technical details
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues
- **[Advanced Features](ADVANCED_FEATURES.md)** - v2.0 features

---

## 🎯 **Use Cases**

### **For Day Traders:**

- Track intraday psychology
- Find best trading hours
- Monitor FOMO trades
- Calculate true win rate

### **For Swing Traders:**

- Long-term EV analysis
- Strategy profitability
- Fee impact on returns
- Timeframe comparisons

### **For All Traders:**

- Identify emotional patterns
- Reduce mistake costs
- Improve discipline
- Data-driven decisions

---

## 🚀 **Deployment**

### **Vercel (Recommended)**

```bash
# 1. Push to GitHub
git add .
git commit -m "Initial commit"
git push

# 2. Import to Vercel
vercel

# 3. Add environment variables in Vercel dashboard
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Deploy
vercel --prod
```

### **Other Options:**

- Netlify
- Railway
- Docker
- Self-hosted

---

## 🤝 **Contributing**

Contributions welcome! Please:

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📝 **License**

MIT License - see [LICENSE](LICENSE) file

---

## 🙏 **Acknowledgments**

Built with:

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)

---

## 📞 **Support**

- 📧 Email: support@tradingjournal.com
- 💬 Discord: [Join our community](https://discord.gg/tradingjournal)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/trading-journal/issues)

---

## 🗺️ **Roadmap**

### **v3.1** (Coming Soon)

- [ ] Complete Psychology Tag UI
- [ ] Trading Hours Chart
- [ ] Tag-based filtering
- [ ] Psychology trends

### **v4.0** (Future)

- [ ] Custom tags
- [ ] Strategy backtesting
- [ ] Social features
- [ ] Mobile app

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ for traders, by traders

**[Get Started →](QUICKSTART.md)** | **[View Demo →](#)** | **[Documentation →](ULTIMATE_GUIDE.md)**

</div>

---

**Version:** 3.0.0-alpha  
**Status:** Active Development 🚧  
**Last Updated:** January 9, 2026
