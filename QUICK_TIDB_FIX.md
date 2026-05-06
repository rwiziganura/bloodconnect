# ⚡ QUICK FIX - TIDB CLOUD 500 ERRORS

## 🔴 PROBLEM
All API endpoints return 500 errors after moving to TiDB Cloud.

## 🟢 SOLUTION (2 STEPS)

### Step 1: Fix .env Password

**File:** `server/.env`

Find this line:
```
DB_PASSWORD=YOUR_NEW_PASSWORD_HERE
```

Replace with your actual TiDB Cloud password:
```
DB_PASSWORD=n8FlLrdof7QNiVMS
```

**How to find your password:**
1. Go to https://tidbcloud.com
2. Login
3. Click your cluster
4. Click "Connect"
5. Copy password from connection string

### Step 2: Restart Backend

```bash
cd server
npm run dev
```

Expected output:
```
✅ Database connection verified
BloodConnect server listening on http://localhost:5000
```

---

## ✅ TEST IT

### Test Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@test.com",
    "password": "password123",
    "role": "donor",
    "donorProfile": {"blood_type": "O+", "city": "NYC"}
  }'
```

Should return: `{"user":{...},"token":"..."}`

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

Should return: `{"user":{...},"token":"..."}`

---

## 🎯 DONE!

If tests pass, all 500 errors are fixed! 🎉

If still getting errors:
1. Check backend console for error message
2. Run: `node tidb-diagnostic.mjs`
3. Verify password is correct
4. Check TiDB Cloud IP whitelist
