# 🔑 TIDB CLOUD PASSWORD - HOW TO GET IT

## ❌ CURRENT ERROR

```
Access denied for user 'EKBMzWXHKo28J9b.root'@'154.68.72.210' (using password: YES)
```

**This means:** The password in `.env` is WRONG.

---

## ✅ HOW TO GET THE CORRECT PASSWORD

### Method 1: From TiDB Cloud Console (RECOMMENDED)

1. **Go to TiDB Cloud**
   - Open https://tidbcloud.com
   - Login with your account

2. **Find Your Cluster**
   - Click "Clusters" in left menu
   - Find your cluster (should be "bloodconnect" or similar)
   - Click on it

3. **Get Connection String**
   - Click "Connect" button
   - Select "MySQL Client"
   - You'll see a connection string like:
   ```
   mysql -h gateway01.us-east-1.prod.aws.tidbcloud.com -P 4000 -u EKBMzWXHKo28J9b.root -p
   ```

4. **Extract Password**
   - Look for the password in the connection dialog
   - It might be shown as a separate field
   - Or in the full connection string

5. **Update .env**
   ```bash
   # Edit server/.env
   DB_PASSWORD=YOUR_PASSWORD_HERE
   ```

### Method 2: Reset Password in TiDB Cloud

If you forgot the password:

1. Go to TiDB Cloud console
2. Click your cluster
3. Click "Security" or "Users"
4. Find user "EKBMzWXHKo28J9b.root"
5. Click "Reset Password"
6. Copy the new password
7. Update `.env` file

### Method 3: Check Connection String

Look for the full connection string in TiDB Cloud:

```
mysql -h gateway01.us-east-1.prod.aws.tidbcloud.com -P 4000 -u EKBMzWXHKo28J9b.root -pYOUR_PASSWORD_HERE
```

The password is after `-p` (no space).

---

## 🧪 TEST THE PASSWORD

### Step 1: Update .env

```bash
# Edit server/.env
DB_PASSWORD=YOUR_ACTUAL_PASSWORD_HERE
```

### Step 2: Run Verification Script

```bash
cd server
node verify-password.mjs
```

**Expected output if correct:**
```
✅ SUCCESS! Password works: YOUR_PASSWORD_HERE
💾 Update your .env file with:
   DB_PASSWORD=YOUR_PASSWORD_HERE
```

### Step 3: Restart Backend

```bash
npm start
```

**Expected output:**
```
✅ Database connection verified
BloodConnect server listening on http://localhost:5000
```

---

## 🔍 COMMON ISSUES

### "Access denied" Error

**Cause:** Wrong password

**Solution:**
1. Double-check password in TiDB Cloud
2. Make sure no extra spaces
3. Check if password has special characters
4. Try resetting password in TiDB Cloud

### "Connection timeout"

**Cause:** IP not whitelisted

**Solution:**
1. Go to TiDB Cloud console
2. Click cluster
3. Click "Security" → "IP Whitelist"
4. Add your IP address (154.68.72.210)
5. Or add 0.0.0.0/0 to allow all IPs

### "Database does not exist"

**Cause:** Database "bloodconnect" not created

**Solution:**
1. Go to TiDB Cloud console
2. Click "SQL Editor"
3. Run: `CREATE DATABASE bloodconnect;`
4. Run migrations to create tables

---

## 📋 CHECKLIST

- [ ] Logged into TiDB Cloud
- [ ] Found your cluster
- [ ] Clicked "Connect"
- [ ] Copied password
- [ ] Updated DB_PASSWORD in .env
- [ ] Ran verify-password.mjs
- [ ] Got "SUCCESS" message
- [ ] Restarted backend
- [ ] Backend shows "Database connection verified"

---

## 🚀 NEXT STEPS

1. **Get Password**
   - Go to TiDB Cloud
   - Copy password from connection string

2. **Update .env**
   ```bash
   DB_PASSWORD=YOUR_PASSWORD_HERE
   ```

3. **Verify**
   ```bash
   node verify-password.mjs
   ```

4. **Restart**
   ```bash
   npm start
   ```

5. **Test**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"password123"}'
   ```

---

## 💡 TIPS

- Password is case-sensitive
- Don't include quotes in .env
- No spaces around `=` in .env
- If password has special characters, it's fine
- Password might be different from your TiDB Cloud account password

---

## ❓ STILL STUCK?

1. Check TiDB Cloud console for error messages
2. Verify cluster is running (not paused)
3. Check IP whitelist includes your IP
4. Try resetting password
5. Contact TiDB Cloud support

**Status:** Once you have the correct password, all 500 errors will be fixed! ✅
