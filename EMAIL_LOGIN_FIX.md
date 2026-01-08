# 🔧 FIX: Email Login Not Working

## ❌ PROBLEM: Registered tapi ga bisa login

**Cause:** Supabase butuh **email confirmation** by default!

## ✅ SOLUTION (2 Options):

---

## 🚀 Option 1: DISABLE Email Confirmation (RECOMMENDED)

### **Step 1: Buka Supabase Dashboard**

```
https://supabase.com/dashboard/project/xkzmdodmweuvkguszr/auth/users
```

### **Step 2: Go to Email Settings**

1. Click **Authentication** (sidebar kiri)
2. Click **Settings**
3. Scroll ke **Email Auth**

### **Step 3: Disable Email Confirmation**

1. Find **"Enable email confirmations"**
2. **TOGGLE OFF** (disable)
3. Click **Save**

### **Step 4: Delete & Re-register**

1. Go to **Authentication** → **Users**
2. Delete user yang tadi dibuat
3. Refresh app: http://localhost:3000/login
4. **Sign up ulang**
5. ✅ **LANGSUNG BISA LOGIN!**

---

## 📧 Option 2: Confirm Email Manually

### **Step 1: Check Email**

- Buka email yang dipakai register
- Cari email dari Supabase
- Click link confirmation

### **Step 2: Email Confirmed**

- Setelah click link
- ✅ **Bisa login!**

### **MASALAH:**

- Kadang email masuk **SPAM**
- Atau **ga dikirim** kalo pake email palsu

---

## 🎯 RECOMMENDED FIX

**Untuk development, DISABLE email confirmation:**

1. Supabase Dashboard → **Authentication** → **Settings**
2. Find **"Enable email confirmations"**
3. **Toggle OFF**
4. **Save**
5. Delete old user & re-register
6. ✅ **WORKS!**

---

## 🔗 DIRECT LINK

**Supabase Auth Settings:**

```
https://supabase.com/dashboard/project/xkzmdodmweuvkguszr/settings/auth
```

**Supabase Users (Delete old user):**

```
https://supabase.com/dashboard/project/xkzmdodmweuvkguszr/auth/users
```

---

## 📸 VISUAL GUIDE

### In Supabase Dashboard:

```
Authentication → Settings
├── Email Auth
│   ├── ✅ Enable email signups (keep ON)
│   └── ❌ Enable email confirmations (turn OFF) ← THIS ONE!
│
└── Save
```

---

## ⚡ AFTER FIX

1. **Delete** user lama di Supabase Users
2. **Refresh** http://localhost:3000/login
3. **Sign up** dengan email & password baru
4. ✅ **LANGSUNG LOGIN!** No confirmation needed!

---

## 🧪 TEST

```
Email: test@example.com
Password: test123

Sign Up → LANGSUNG MASUK! ✅
```

---

**GO FIX SEKARANG!** 🚀

**Direct link:**
👉 https://supabase.com/dashboard/project/xkzmdodmweuvkguszr/settings/auth
