# ⚡ QUICK START GUIDE - Trading Journal

**Get your trading journal running in under 10 minutes!**

---

## 🎯 What You'll Get

A beautiful, working trading journal with:

- ✅ Automated fee calculation for 13+ platforms
- ✅ Real-time P&L preview as you type
- ✅ Dark mode professional UI
- ✅ Secure database storage
- ✅ Mobile-responsive design

---

## 📦 Prerequisites

Make sure you have:

- ✅ **Node.js 18+** installed ([Download here](https://nodejs.org/))
- ✅ **A code editor** (VS Code recommended)
- ✅ **A Supabase account** (Free tier works perfectly - [Sign up here](https://supabase.com))

---

## 🚀 Setup in 5 Steps

### Step 1: Install Dependencies (2 minutes)

Open your terminal in the project folder and run:

```bash
npm install
```

This will install:

- Next.js
- Supabase
- Framer Motion (animations)
- Lucide Icons
- Tailwind CSS

**Wait for it to complete...** ☕

---

### Step 2: Create Supabase Project (3 minutes)

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name:** Trading Journal (or anything you like)
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose closest to you
4. Click **"Create New Project"**
5. Wait for project to finish setting up (~2 minutes)

---

### Step 3: Set Up Database (2 minutes)

1. In your Supabase dashboard, find **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Open `migrations/001_create_trading_logs.sql` from this project
4. **Copy ALL the content** (Ctrl+A, Ctrl+C)
5. **Paste** into the SQL Editor
6. Click **"Run"** button (or press F5)
7. You should see ✅ "Success. No rows returned"

**You just created your database!** 🎉

---

### Step 4: Get Your Supabase Credentials (1 minute)

1. In Supabase dashboard, click **"Settings"** (gear icon)
2. Click **"API"** in the sidebar
3. You'll see two things you need:

   **Project URL**

   ```
   https://xxxxxxxxxxxxxx.supabase.co
   ```

   **anon/public key** (looks like a long JWT token)

   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...
   ```

4. **Copy both** (you'll need them in the next step)

---

### Step 5: Configure Your App (1 minute)

1. In your project folder, create a file named `.env.local`
2. Paste this content:

```env
NEXT_PUBLIC_SUPABASE_URL=paste_your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_anon_key_here
```

3. Replace the values with what you copied in Step 4
4. **Save the file**

**Example:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODAwMDAwMDAsImV4cCI6MTk5NTU3NjAwMH0.xxxxxxxxxxxxxxxxxxxx
```

---

## 🎉 Launch Your App!

Run this command:

```bash
npm run dev
```

You should see:

```
✓ Ready in 2.3s
○ Local:   http://localhost:3000
```

**Open your browser** and go to: [http://localhost:3000](http://localhost:3000)

---

## 🎨 Using the Dashboard

### First Time Setup

If your app doesn't have authentication yet, you'll need to add the component to a page:

1. Create `src/app/trading/page.tsx`
2. Paste this code:

```typescript
import TradingDashboard from "@/components/TradingDashboard";

export default function TradingPage() {
  return <TradingDashboard />;
}
```

3. Navigate to: [http://localhost:3000/trading](http://localhost:3000/trading)

---

### Recording Your First Trade

Let's record a sample Bitcoin trade!

1. **Select Asset Type:** Click **"Crypto"**
2. **Choose Platform:** Click on **"Binance"** chip
3. **Enter Asset Name:** Type `BTC/USDT`
4. **Order Type:** Select **"Long (Buy)"**
5. **Entry Price:** Enter `50000`
6. **Exit Price:** Enter `51000`
7. **Quantity:** Enter `0.5`
8. **Notes:** (Optional) Type "Test trade"

Watch the **Live Preview** update! You should see:

- Gross P&L: $500
- Buy Fee: $25
- Sell Fee: $25.50
- Total Fees: $50.50
- Net P&L: $449.50
- ROI: 1.80%

9. Click **"Save Trade"**

---

## ✅ Verify It Worked

### In Your App

- You should see "Trade Saved Successfully!" message
- Form should clear after 2 seconds

### In Supabase

1. Go to your Supabase dashboard
2. Click **"Table Editor"**
3. Select **"trading_logs"** table
4. You should see your trade record!

---

## 🎯 What's Next?

### For Users

- Start logging your real trades
- Track your performance over time
- Analyze your win rate and P&L

### For Developers

- **Read `README.md`** for detailed documentation
- **Check `INTEGRATION.md`** for advanced integration
- **See `EXAMPLES.tsx`** for code examples
- **Review `PROJECT_SUMMARY.md`** for architecture details

---

## 🆘 Troubleshooting

### "Module not found" errors

**Solution:** Make sure you ran `npm install` first

### "Invalid API Key" error

**Solution:** Check your `.env.local` file has the correct credentials

### Nothing appears after saving

**Solution:** Make sure you're logged in to Supabase (check browser console)

### Page is blank

**Solution:** Check the browser console for errors. Make sure the component is imported correctly.

### Calculation shows "NaN"

**Solution:** Ensure you entered valid numbers (no letters or symbols except decimal point)

---

## 📚 Quick Reference

### Available Platforms

**Stocks:** Ajaib, Stockbit, IPOT, Mirae Asset, Gotrade, Interactive Brokers  
**Crypto:** Binance, Bybit, Tokocrypto, Indodax, OKX, Reku, Pintu

### Calculation Formula

```
Net P&L = Gross P&L - (Buy Fee + Sell Fee)
ROI = (Net P&L / Initial Investment) × 100
```

### Keyboard Shortcuts

- **Tab:** Navigate between fields
- **Enter:** Submit form (when focused on button)
- **Ctrl+R:** Refresh page

---

## 🎨 Customization Tips

### Change Platform Logo

Edit `src/config/platformFees.ts` and change the `logo` emoji

### Add Your Own Platform

Copy an existing platform config and modify the fees

### Change Colors

- Profit color: Search for `emerald-500` in TradingDashboard.tsx
- Loss color: Search for `rose-500`

---

## 📞 Need Help?

1. **Check the docs:**

   - `README.md` - Full documentation
   - `INTEGRATION.md` - Integration guide
   - `EXAMPLES.tsx` - Code examples

2. **Common issues:**

   - See the Troubleshooting section above
   - Check browser console for errors
   - Verify Supabase connection

3. **Still stuck?**
   - Open an issue on GitHub
   - Include error messages
   - Describe what you tried

---

## 🎉 Congratulations!

You now have a fully functional trading journal!

**Start tracking your trades and improve your trading performance!** 📈

---

**Total Setup Time:** ~10 minutes  
**Difficulty:** Beginner-friendly  
**Cost:** $0 (using free tiers)

**Happy Trading! 🚀💰**
