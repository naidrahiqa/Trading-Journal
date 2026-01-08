# 📊 Advanced Trading Journal & Portfolio Tracker

> Professional trading journal with automated fee calculation, dual currency stats, and email authentication

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Features

### 🔐 **Authentication**

- Email/Password login (100% FREE)
- Secure session management via Supabase Auth
- Protected routes & user profiles

### 📈 **Trading Dashboard**

- **Dual Currency System:**
  - Crypto trades in **USD** ($)
  - Stock trades in **IDR** (Rp)
- Real-time P&L calculations
- Win rate tracking
- Best/Worst trade analytics

### 💰 **Automated Fee Calculation**

- **13 Trading Platforms Supported:**
  - **Stocks (6):** Ajaib, Stockbit, IPOT, Mirae Asset, Gotrade, Interactive Brokers
  - **Crypto (7):** Binance, Bybit, Tokocrypto, Indodax, OKX, Reku, Pintu
- Platform-specific fee structures (2026 rates)
- Automatic fee deduction from P&L

### 📊 **Stock Lot System**

- Indonesian stock market lot conversion (1 lot = 100 shares)
- Automatic calculation for lot-based trades
- Clear display: "10 lot (1,000 lembar)"

### 🎯 **Live Preview**

- Real-time P&L calculation as you type
- Instant fee calculation
- ROI percentage display
- Color-coded profit/loss indicators

### 💡 **Motivational Quotes**

- Dynamic quotes based on performance
- Contextual messages for different win rates
- Encouraging feedback system

### 📱 **Modern UI/UX**

- Premium dark mode design
- Framer Motion animations
- Responsive layout (mobile, tablet, desktop)
- Glassmorphism effects

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase Account (free tier)
- Git

### Installation

```bash
# 1. Clone repository
git clone https://github.com/naidrahiqa/Trading-Journal.git
cd Trading-Journal

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local

# Edit .env.local with your Supabase credentials:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 4. Run database migration
# Go to Supabase SQL Editor and run: migrations/001_create_trading_logs.sql

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 10-minute setup guide
- **[INTEGRATION.md](INTEGRATION.md)** - Advanced integration
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Architecture overview
- **[EMAIL_LOGIN_FIX.md](EMAIL_LOGIN_FIX.md)** - Auth troubleshooting
- **[CURRENCY_UPDATE.md](CURRENCY_UPDATE.md)** - Dual currency system
- **[LOT_SYSTEM.md](LOT_SYSTEM.md)** - Stock lot conversion

---

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animations
- **Lucide React** - Icon library

### Backend

- **Supabase** - PostgreSQL database + Auth
- **Row Level Security (RLS)** - Data protection
- **Real-time subscriptions** - Live updates

---

## 📊 Database Schema

```sql
trading_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  asset_name TEXT,
  asset_type ENUM('crypto', 'stock'),
  platform_id TEXT,
  order_type ENUM('long', 'short'),
  entry_price NUMERIC,
  exit_price NUMERIC,
  quantity NUMERIC,
  gross_pnl NUMERIC,
  total_fee NUMERIC,
  net_pnl NUMERIC,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Includes:**

- 5 performance indexes
- 4 RLS policies (view, insert, update, delete)
- Auto-update trigger
- Analytics view (`trading_stats`)

---

## 🎨 Screenshots

### Dashboard Summary

- Total trades, Win rate, Combined P&L
- Separate crypto (USD) and stock (IDR) stats
- Recent trades list

### Add Trade Form

- Platform selection with brand logos
- Crypto/Stock toggle
- Long/Short order types
- Live P&L preview card

### Login Page

- Email/Password authentication
- Clean, professional design
- Feature highlights

---

## 💡 Key Features Explained

### Dual Currency System

```typescript
// Crypto → USD
formatCurrency(11650.75, "crypto"); // "$11,650.75"

// Stock → IDR
formatCurrency(11650750, "stock"); // "Rp11.650.750"
```

### Lot System for Stocks

```typescript
// User input: 10 lot
// System calculates: 10 × 100 = 1,000 shares
// Display: "10 lot (1,000 lembar)"
```

### Automated Fee Calculation

```typescript
// Example: Bitcoin on Binance (0.1% fee)
Entry: $50,000 × 0.5 BTC = $25,000
Exit:  $51,000 × 0.5 BTC = $25,500
Gross P&L: $500
Buy Fee: $25 (0.1%)
Sell Fee: $25.50 (0.1%)
Net P&L: $449.50
```

---

## 🔐 Security

- ✅ Row Level Security (RLS) enabled
- ✅ Users only see their own data
- ✅ Authentication required for all operations
- ✅ SQL injection protection (parameterized queries)
- ✅ Full TypeScript type safety

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Add environment variables in Vercel dashboard
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

## 📈 Roadmap

- [ ] Email notifications (weekly summary)
- [ ] Charts & visualizations
- [ ] Trade history table with filters
- [ ] Export to CSV/Excel
- [ ] Mobile app (React Native)
- [ ] Advanced analytics (Sharpe ratio, etc.)
- [ ] Multi-currency support
- [ ] Tax reporting

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Naidra Hiqa**

- GitHub: [@naidrahiqa](https://github.com/naidrahiqa)

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database & Auth by [Supabase](https://supabase.com/)
- UI components inspired by modern fintech applications
- Fee data based on 2026 platform rates

---

## 📞 Support

If you have any questions or run into issues:

1. Check the [documentation](docs/)
2. Search [existing issues](https://github.com/naidrahiqa/Trading-Journal/issues)
3. Open a [new issue](https://github.com/naidrahiqa/Trading-Journal/issues/new)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by [Naidra Hiqa](https://github.com/naidrahiqa)

</div>
