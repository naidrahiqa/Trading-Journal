# 🚀 Integration Guide - Trading Journal Dashboard

This guide will help you integrate the Trading Journal Dashboard into your existing Next.js application.

---

## 📋 Step-by-Step Integration

### Step 1: Database Setup (Supabase)

1. **Login to Supabase**

   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your project or create a new one

2. **Run SQL Migration**

   - Navigate to **SQL Editor** in the left sidebar
   - Open `migrations/001_create_trading_logs.sql` from this project
   - Copy the entire content
   - Paste into the SQL Editor
   - Click **Run** to execute

3. **Verify Tables Created**
   - Go to **Table Editor**
   - You should see `trading_logs` table
   - Check that RLS is enabled (shield icon should be green)

---

### Step 2: Install Dependencies

```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js framer-motion lucide-react
```

Or with yarn:

```bash
yarn add @supabase/auth-helpers-nextjs @supabase/supabase-js framer-motion lucide-react
```

---

### Step 3: Configure Environment Variables

1. Create `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

2. Get credentials from:
   - Supabase Dashboard → **Settings** → **API**
   - Copy **Project URL** and **anon/public** key

---

### Step 4: Configure Supabase Client

Create `src/lib/supabase.ts` if you don't have it:

```typescript
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const supabase = createClientComponentClient();
```

---

### Step 5: Copy Project Files

Copy these files to your project:

```
src/
├── components/
│   └── TradingDashboard.tsx      ✅ Main component
├── config/
│   └── platformFees.ts           ✅ Fee configuration
├── types/
│   └── trading.ts                ✅ TypeScript types
└── utils/
    └── tradingCalculations.ts    ✅ Calculation utilities
```

---

### Step 6: Add Component to Your App

#### Option A: As a Standalone Page

Create `src/app/trading/page.tsx`:

```typescript
import TradingDashboard from "@/components/TradingDashboard";

export default function TradingPage() {
  return <TradingDashboard />;
}
```

#### Option B: In an Existing Dashboard

```typescript
import TradingDashboard from "@/components/TradingDashboard";

export default function Dashboard() {
  return (
    <div className="dashboard-layout">
      <h1>My Portfolio Dashboard</h1>

      {/* Add Trading Journal Section */}
      <section className="trading-journal-section">
        <TradingDashboard />
      </section>
    </div>
  );
}
```

---

### Step 7: Update Tailwind Config (Optional)

If you want the custom colors, update `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#0a0f1a",
        },
        emerald: {
          400: "#34d399",
          500: "#10b981",
        },
        rose: {
          400: "#fb7185",
          500: "#f43f5e",
        },
      },
    },
  },
};
```

---

### Step 8: Configure Path Aliases

Make sure your `tsconfig.json` has path aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

If you use different aliases (e.g., `~/` instead of `@/`), update imports accordingly.

---

### Step 9: Test the Integration

1. **Start dev server**:

   ```bash
   npm run dev
   ```

2. **Navigate to** `http://localhost:3000/trading` (or wherever you added it)

3. **Test the form**:

   - Switch between Crypto/Stocks
   - Select a platform
   - Enter trade details
   - Check live preview updates
   - Submit a test trade

4. **Verify in Supabase**:
   - Go to **Table Editor** → `trading_logs`
   - Your test trade should appear

---

## 🔐 Authentication Integration

The component requires users to be authenticated. Here's how to integrate with common auth setups:

### With Supabase Auth

```typescript
// src/app/trading/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TradingDashboard from "@/components/TradingDashboard";

export default async function TradingPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return <TradingDashboard />;
}
```

### With Custom Auth Provider

Wrap the component with your auth check:

```typescript
import { useAuth } from "@/hooks/useAuth";
import TradingDashboard from "@/components/TradingDashboard";

export default function TradingPage() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginPrompt />;

  return <TradingDashboard />;
}
```

---

## 🎨 Customization Options

### Change Currency Display

Edit `src/utils/tradingCalculations.ts`:

```typescript
export const formatCurrency = (
  value: number,
  currency: string = "IDR", // Change default here
  decimals: number = 0 // Change decimals for IDR
): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};
```

### Add New Platform

Edit `src/config/platformFees.ts`:

```typescript
const newPlatform: PlatformConfig = {
  id: "my_broker",
  name: "My Broker",
  logo: "💎",
  assetType: "stock",
  color: "#FF6B00",
  fees: {
    buy: 0.2,
    sell: 0.3,
    type: "percentage",
    description: "Buy 0.20% | Sell 0.30%",
  },
};

// Add to respective array
stockPlatforms.push(newPlatform);
```

### Modify Color Scheme

The component uses Tailwind utility classes. Search and replace:

- `emerald-500` → your profit color
- `rose-500` → your loss color
- `slate-900` → your background color

---

## 📊 Fetching Trade History

To display trade history, create a new component:

```typescript
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { TradingLog } from "@/types/trading";

export default function TradeHistory() {
  const [trades, setTrades] = useState<TradingLog[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchTrades() {
      const { data, error } = await supabase
        .from("trading_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setTrades(data);
      }
    }

    fetchTrades();
  }, []);

  return (
    <div>
      {trades.map((trade) => (
        <div key={trade.id}>
          {trade.asset_name} - {trade.net_pnl}
        </div>
      ))}
    </div>
  );
}
```

---

## 🐛 Common Issues

### Issue: Module Not Found '@/types/trading'

**Solution**: Check your `tsconfig.json` has correct path mapping:

```json
"paths": {
  "@/*": ["./src/*"]
}
```

### Issue: Framer Motion Hydration Error

**Solution**: Add `'use client'` directive at the top of `TradingDashboard.tsx` (already included).

### Issue: RLS Policy Denying Access

**Solution**: Make sure user is authenticated:

```typescript
const {
  data: { user },
} = await supabase.auth.getUser();
console.log("Current user:", user); // Should not be null
```

---

## 📈 Next Steps

After integration, consider adding:

1. **Trade History Table** - Display past trades with filters
2. **Analytics Dashboard** - Charts for P&L trends, win rate
3. **Export Functionality** - Download trades as CSV
4. **Trade Editing** - Update/delete existing trades
5. **Multi-currency Support** - Handle different currencies

---

## 💡 Pro Tips

1. **Enable Real-time Updates**:

   ```typescript
   supabase
     .channel("trading_logs")
     .on(
       "postgres_changes",
       {
         event: "*",
         schema: "public",
         table: "trading_logs",
       },
       (payload) => {
         console.log("Change received!", payload);
         // Refresh your trade list
       }
     )
     .subscribe();
   ```

2. **Add Loading States**: The component already has submit loading states, but you can add skeleton loaders for better UX.

3. **Form Persistence**: Save form data to localStorage so users don't lose input on page refresh.

---

**Need help? Check the README.md or open an issue!** 🚀
