# 🚀 Quick Start Guide - Trading Journal v4.0.0

Get up and running in 5 minutes! ⚡

---

## ✅ **Prerequisites**

- Node.js 18+ installed
- npm 9+ installed
- Supabase account (free)
- Git installed

---

## 📦 **Step 1: Clone Repository**

```bash
git clone https://github.com/naidrahiqa/Trading-Journal.git
cd  Trading-Journal
```

---

## 🔧 **Step 2: Install Dependencies**

```bash
npm install
```

This will install:

- Next.js 14
- Supabase client
- Framer Motion
- Tailwind CSS
- date-fns
- html2canvas
- And more!

---

## 🗄️ **Step 3: Setup Supabase**

### **3.1. Create Project**

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for database to initialize (~2 minutes)

### **3.2. Run SQL Migrations**

Go to SQL Editor in Supabase and run these migrations **in order**:

#### **Migration 1: Core Schema** (REQUIRED)

```sql
-- Copy and paste content from:
migrations/001_create_trading_logs.sql
```

This creates:

- `trading_logs` table
- RLS policies
- Enums (asset_type, order_type)
- Indexes

#### **Migration 2: Psychology Features** (RECOMMENDED)

```sql
-- Copy and paste content from:
migrations/003_psychology_tags.sql
```

This adds:

- Psychology tags column
- Analytics views
- Helper functions

#### **Migration 3: Enhanced Features** (OPTIONAL)

```sql
-- Copy and paste content from:
migrations/002_enhanced_features.sql
```

This adds:

- Performance indexes
- Statistics views

### **3.3. Get API Keys**

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like: `https://xxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

---

## 🔐 **Step 4: Environment Variables**

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Example:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🚀 **Step 5: Run Development Server**

```bash
npm run dev
```

Visit: **http://localhost:3000**

You should see the login page! 🎉

---

## 👤 **Step 6: Create Account**

1. Click **"Daftar GRATIS"**
2. Enter email & password (min 6 characters)
3. Click **Sign Up**

**Note:** Check Supabase → Authentication → Users to see your account!

---

## 📊 **Step 7: Add Your First Trade**

1. After login, you'll see the dashboard
2. Click **"Add Trade"** tab
3. Select:
   - Asset type (Crypto/Stocks)
   - Platform (e.g., Binance)
   - Asset name (e.g., BTC/USDT)
   - Order type (Long/Short)
   - Entry price, Exit price, Quantity
4. Watch the **Live Preview** calculate your P&L!
5. Click **"Save Trade"**

Done! Your first trade is logged! ✅

---

## 🎯 **What's Next?**

### **Explore Features:**

1. **Dashboard Tab**

   - View all trades
   - Filter by timeframe (7d, 1m, 3m, etc.)
   - Toggle view modes (Minimalist vs Kece Abis)
   - See win rate, total ROI, etc.

2. **Share PnL Cards**

   - Click share button (📤) on any trade
   - Generate beautiful card
   - Download or share to social media

3. **Psychology Tags** (if you ran migration 003)
   - Tag trades with emotions (FOMO, Disciplined, etc.)
   - See Mistake Cost Widget
   - Track emotional trading patterns

---

## 📱 **Mobile Testing**

1. Find your local IP:

   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. Access from phone:

   ```
   http://[your-ip]:3000
   ```

3. Test responsive design!

---

## 🏗️ **Build for Production**

```bash
# Test build
npm run build

# Run production server
npm start
```

Build should complete successfully! ✅

---

## 🚢 **Deploy to Vercel**

### **Quick Deploy:**

1. Push to GitHub:

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**!

Your app is live in ~2 minutes! 🎉

---

## ⚙️ **Customization**

### **Add More Brokers:**

Edit `src/constants/ListBroker.json`:

```json
{
  "id": "my_broker",
  "name": "My Broker",
  "category": "stock",
  "buyFee": 0.15,
  "sellFee": 0.25,
  "color": "#FF5733",
  "logoType": "custom"
}
```

That's it! New broker appears automatically! ✨

### **Change Colors:**

Edit `tailwind.config.js` or component files.

---

## 🐛 **Troubleshooting**

### **Can't login?**

- Check Supabase → Authentication → Email settings
- Disable email confirmation for testing
- Check environment variables are correct

### **Platform list empty?**

- Check `ListBroker.json` exists
- Check `platformFees.ts` imports correctly
- Restart dev server

### **Build errors?**

- Run `npm install` again
- Delete `.next` folder
- Check TypeScript errors: `npm run build`

**More help:** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 📚 **Learn More**

- **[Ultimate Guide](ULTIMATE_GUIDE.md)** - All features explained
- **[Architecture](ARCHITECTURE.md)** - How it works
- **[Advanced Features](ADVANCED_FEATURES.md)** - Deep dive

---

## 🎉 **You're Ready!**

Your trading journal is now:

- ✅ Running locally
- ✅ Connected to Supabase
- ✅ Ready to track trades
- ✅ Mobile optimized
- ✅ Production ready

**Happy Trading! 📈**

---

**Need help?** Open an issue on GitHub!  
**Version:** 4.0.0  
**Last Updated:** January 9, 2026
