# 🚀 BloodConnect Production Deployment Guide

## ✅ Current Setup

- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Node.js + Express)
- **Database**: TiDB Cloud (MySQL-compatible)

## 📋 Pre-Deployment Checklist

### Backend (Render)

1. **Environment Variables on Render:**
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
   DB_PORT=4000
   DB_USER=EKBMzWXHKo28J9b.root
   DB_PASSWORD=7gclHJOSmiDKWKLa
   DB_NAME=bloodconnect
   JWT_SECRET=bloodconnect_super_secret_jwt_key_2024_do_not_share
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://bloodconnect.vercel.app
   ```

2. **Render Settings:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Auto-Deploy: Enabled (from main branch)

### Frontend (Vercel)

1. **Environment Variables on Vercel:**
   ```
   VITE_API_URL=https://bloodconnect-zptd.onrender.com/api
   ```

2. **Vercel Settings:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## 🔧 Local Development Setup

### Backend
```bash
cd server
npm install
npm run dev  # Uses nodemon for hot reload
```

### Frontend
```bash
cd client
npm install
npm run dev  # Runs on http://localhost:5173
```

## 🐛 Troubleshooting Production Issues

### Issue 1: 500 Internal Server Error on Register/Login

**Symptoms:**
- Frontend shows "Request failed with status code 500"
- Backend logs show database column errors

**Solution:**
1. Check backend logs on Render dashboard
2. Verify database columns match the INSERT queries
3. Ensure `created_at` columns have default values or are removed from queries

**Fixed in authController.js:**
- Removed `created_at` from INSERT queries (uses database defaults)
- Added proper error handling for missing columns

### Issue 2: CORS Errors

**Symptoms:**
- Browser console shows "blocked by CORS policy"
- Network tab shows failed OPTIONS requests

**Solution:**
1. Verify CORS configuration in `server.js` includes your frontend URL
2. Check that backend is responding to OPTIONS requests
3. Ensure credentials are properly configured

**Current CORS Config:**
```javascript
origin: [
  'http://localhost:5173',
  'https://bloodconnect.vercel.app',
  process.env.FRONTEND_URL
]
```

### Issue 3: API Base URL Issues

**Symptoms:**
- Frontend makes requests to wrong URL
- 404 errors on API endpoints

**Solution:**
1. Check `.env.production` has correct `VITE_API_URL`
2. Verify Vercel environment variables are set
3. Check browser console for "API Base URL" log

**Current Setup:**
- Development: `http://localhost:5000/api`
- Production: `https://bloodconnect-zptd.onrender.com/api`

### Issue 4: Database Connection Errors

**Symptoms:**
- Backend crashes on startup
- "Connection refused" or "Access denied" errors

**Solution:**
1. Verify TiDB Cloud credentials in Render environment variables
2. Check TiDB Cloud IP whitelist (should allow all IPs for Render)
3. Ensure SSL is configured: `rejectUnauthorized: false`

**Current DB Config:**
```javascript
ssl: {
  minVersion: 'TLSv1.2',
  rejectUnauthorized: false
}
```

### Issue 5: JWT Token Issues

**Symptoms:**
- Users get logged out immediately
- "Unauthorized" errors after login

**Solution:**
1. Verify `JWT_SECRET` is set in Render environment variables
2. Check token is being stored in localStorage
3. Verify Authorization header is being sent

**Current Token Flow:**
1. Login → Backend generates JWT
2. Frontend stores in `localStorage.setItem('bloodconnect_token', token)`
3. API interceptor adds `Authorization: Bearer ${token}` to all requests

## 📊 Monitoring & Logs

### Backend Logs (Render)
```bash
# View live logs
https://dashboard.render.com/web/[your-service-id]/logs
```

### Frontend Logs (Vercel)
```bash
# View deployment logs
https://vercel.com/[your-project]/deployments
```

### Database Logs (TiDB Cloud)
```bash
# View slow queries and errors
https://tidbcloud.com/console/clusters
```

## 🧪 Testing Production Deployment

### 1. Test Backend Health
```bash
curl https://bloodconnect-zptd.onrender.com/api/health
```

Expected response:
```json
{
  "ok": true,
  "message": "BloodConnect API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Test Database Connection
```bash
curl https://bloodconnect-zptd.onrender.com/api/db/ping
```

Expected response:
```json
{
  "ok": true,
  "database": "bloodconnect",
  "result": { "ok": 1 }
}
```

### 3. Test Registration
```bash
curl -X POST https://bloodconnect-zptd.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "donor",
    "donorProfile": {
      "blood_type": "O+",
      "city": "Kigali"
    }
  }'
```

### 4. Test Frontend
1. Open https://bloodconnect.vercel.app
2. Open browser DevTools (F12)
3. Check Console for "API Base URL" log
4. Try to register/login
5. Check Network tab for API requests

## 🔐 Security Checklist

- [x] JWT_SECRET is strong and unique
- [x] Database credentials are in environment variables (not in code)
- [x] CORS is configured to allow only trusted origins
- [x] Passwords are hashed with bcrypt (10 rounds)
- [x] SQL injection prevention (using parameterized queries)
- [x] SSL/TLS enabled for database connection
- [ ] Rate limiting implemented (TODO)
- [ ] Input validation on all endpoints (TODO)

## 📝 Common Commands

### Redeploy Backend (Render)
```bash
git push origin main  # Auto-deploys if connected to GitHub
```

### Redeploy Frontend (Vercel)
```bash
cd client
npm run build
vercel --prod
```

### Check Backend Status
```bash
curl https://bloodconnect-zptd.onrender.com/api/health
```

### View Backend Logs
```bash
# On Render dashboard
https://dashboard.render.com/web/[service-id]/logs
```

## 🆘 Emergency Rollback

### Rollback Backend (Render)
1. Go to Render dashboard
2. Click on your service
3. Go to "Deploys" tab
4. Click "Rollback" on previous working deployment

### Rollback Frontend (Vercel)
1. Go to Vercel dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Click "..." on previous working deployment
5. Click "Promote to Production"

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **TiDB Cloud Docs**: https://docs.pingcap.com/tidbcloud
- **Express CORS**: https://expressjs.com/en/resources/middleware/cors.html

## ✅ Deployment Success Indicators

- [ ] Backend health endpoint returns 200 OK
- [ ] Database ping endpoint returns 200 OK
- [ ] Frontend loads without console errors
- [ ] Registration works and returns JWT token
- [ ] Login works and redirects to dashboard
- [ ] API requests include Authorization header
- [ ] No CORS errors in browser console
- [ ] Backend logs show successful database connection

---

**Last Updated**: 2024
**Status**: Production Ready ✅
