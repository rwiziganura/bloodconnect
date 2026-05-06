# ⚡ QUICK FIX - REGISTRATION/LOGIN NOT WORKING

## 🔴 PROBLEM
Clicking "Register" or "Login" does nothing.

## 🟢 SOLUTION (3 STEPS)

### Step 1: Stop Frontend
```bash
# Press Ctrl+C in the terminal running frontend
```

### Step 2: Restart Frontend
```bash
cd client
npm run dev
```

### Step 3: Test
1. Open http://localhost:5173
2. Click "Register"
3. Fill form and submit
4. Should work! ✅

---

## 🔧 WHAT WAS FIXED

**File 1:** `client/vite.config.js`
- Changed port from 5001 → 5000

**File 2:** `client/src/pages/Register.jsx`
- Changed from `axios` → `api` instance

**File 3:** `client/src/pages/Login.jsx`
- Changed from `axios` → `api` instance

---

## ✅ VERIFY IT WORKS

### Test Registration
```
1. Go to http://localhost:5173
2. Click "Register"
3. Select "I am a donor"
4. Click "Continue"
5. Fill in:
   - Name: Test User
   - Email: test@test.com
   - Password: password123
   - Blood Type: O+
   - City: New York
6. Click "Create account"
7. Should redirect to dashboard ✅
```

### Test Login
```
1. Go to http://localhost:5173/login
2. Enter:
   - Email: test@test.com
   - Password: password123
3. Click "Sign In"
4. Should redirect to dashboard ✅
```

---

## 🎯 DONE!

Your registration and login are now working! 🎉

If you still have issues:
1. Check backend is running: `npm run dev` in `server/` folder
2. Check frontend is running: `npm run dev` in `client/` folder
3. Check browser console for errors (F12)
4. Check backend console for error messages
