# 📊 Stock Lot System Update

## ✅ **FITUR BARU: SISTEM LOT UNTUK SAHAM**

### **Perubahan:**

1. **Input Quantity untuk Saham:**

   - Label: **"Quantity (Lot)"**
   - Helper text: **"1 lot = 100 lembar saham"**
   - Placeholder: **"Jumlah lot"**

2. **Auto-Conversion:**

   - User input: **Lot** (contoh: `10`)
   - Sistem convert ke: **Shares** (10 × 100 = `1,000 lembar`)
   - Database simpan: **1,000 lembar**

3. **Display di Live Preview:**
   ```
   Quantity: 10 lot (1,000 lembar)
   ```

---

## 🧮 **CARA KERJA**

### **Contoh Trade Saham:**

**Input User:**

- Asset Type: **Stock**
- Platform: **Ajaib**
- Asset Name: **BBRI**
- Entry Price: **Rp 4,500**
- Exit Price: **Rp 5,000**
- Quantity: **10** lot ← User input dalam lot

**Sistem Calculation:**

```javascript
// Convert lot to shares
actualQuantity = 10 lot × 100 = 1,000 lembar

// Calculate
Entry Value = Rp 4,500 × 1,000 = Rp 4,500,000
Exit Value  = Rp 5,000 × 1,000 = Rp 5,000,000
Gross P&L   = Rp 500,000

// Fees (Ajaib: Buy 0.15%, Sell 0.25%)
Buy Fee  = Rp 4,500,000 × 0.0015 = Rp 6,750
Sell Fee = Rp 5,000,000 × 0.0025 = Rp 12,500
Total Fee = Rp 19,250

Net P&L = Rp 500,000 - Rp 19,250 = Rp 480,750
```

**Display Preview:**

```
Net Profit/Loss:    Rp480.750

Quantity:           10 lot (1,000 lembar)
Total Investment:   Rp4.500.000
```

---

## 📊 **PERBEDAAN CRYPTO VS STOCK**

| Aspek              | Crypto        | Stock               |
| ------------------ | ------------- | ------------------- |
| **Currency**       | USD ($)       | IDR (Rp)            |
| **Quantity Label** | "Quantity"    | "Quantity (Lot)"    |
| **Input**          | Coins/Tokens  | Lot                 |
| **Calculation**    | Direct        | Lot × 100           |
| **Display**        | Quantity only | Lot + Lembar        |
| **Database**       | As-is         | Converted to shares |

---

## 🧪 **CARA TEST**

### **Test Stock dengan Lot:**

1. **Refresh browser** (Ctrl + Shift + R)
2. Toggle ke **"Stocks"**
3. Pilih platform (contoh: **Ajaib**)
4. Isi form:
   - Asset Name: **BBRI**
   - Entry: **4500**
   - Exit: **5000**
   - Quantity: **10** ← Input dalam lot
5. **Lihat Live Preview:**
   - Harus muncul: **"10 lot (1,000 lembar)"**
   - Calculation menggunakan 1,000 lembar
   - Currency dalam **Rupiah (Rp)**

### **Test Crypto (Tidak Berubah):**

1. Toggle ke **"Crypto"**
2. Input quantity langsung (no lot conversion)
3. Currency dalam **USD ($)**

---

## 📝 **YANG TERSIMPAN DI DATABASE**

### Stock Trade:

```json
{
  "asset_type": "stock",
  "quantity": 1000,        ← Tersimpan dalam lembar (shares)
  "entry_price": 4500,
  "exit_price": 5000,
  "gross_pnl": 500000,
  "total_fee": 19250,
  "net_pnl": 480750
}
```

### Crypto Trade:

```json
{
  "asset_type": "crypto",
  "quantity": 0.5,         ← Tersimpan as-is
  "entry_price": 50000,
  "exit_price": 51000,
  "gross_pnl": 500,
  "total_fee": 50.50,
  "net_pnl": 449.50
}
```

---

## ✅ **LOKASI UPDATE**

1. `src/components/TradingDashboard.tsx`:
   - Line 82: Lot to shares conversion in calculation
   - Line 382-392: Updated quantity input label & helper
   - Line 164: Convert lot to shares when saving
   - Line 536-543: Display lot & shares in preview

---

## 🎯 **STATUS**

- ✅ Lot system untuk stock
- ✅ Auto-convert ke shares (×100)
- ✅ Display lot + lembar di preview
- ✅ Database simpan dalam shares
- ✅ Crypto tetap tidak berubah

**Refresh browser untuk melihat perubahan!** 🚀
