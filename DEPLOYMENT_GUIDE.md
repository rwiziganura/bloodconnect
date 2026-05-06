# 🚀 BloodConnect Full-Stack Deployment Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│                    Deployed on Vercel                       │
│                  https://bloodconnect.vercel.app            │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API Calls
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + Express)                    │
│                  Deployed on Render                         │
│              https://bloodconnect.onrender.com              │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL Queries
                         ↓
┌─────────────────────────────────────────────────────────────┐
│           DATABASE (MySQL - TiDB Cloud)                     │
│      gateway01.us-east-1.prod.aws.tidbcloud.com:4000       │
│                    SSL Enabled                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

- Node.js 16+ installed
- Git account (GitHub)
- Vercel account (free)
- Render account (free)
- TiDB Cloud account (already configured)

---

## 🔧 LOCAL DEVELOPMENT SETUP

### 1. Clone and Install Dependencies

```bash
# Backend setup
cd server
npm install

# Frontend setup
cd ../client
npm install
```

### 2. Configure Environment Variables

**Backend (.env):**
```
PORT=5000
NODE_ENV=development
DB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
DB_USER=EKBMzWXHKo28J9b.root
DB_PASSWORD=n8FlLrdof7QNiVMS
DB_NAME=sys
DB_PORT=4000
JWT_SECRET=dev_secret_key_change_in_production
```

**Frontend (.env.local):**
```
VITE_API_URL=http://localhost:5000
```

### 3. Run Locally

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Test Database Connection

```bash
curl http://localhost:5000/api/db/ping
```

Expected response:
```json
{
  "ok": true,
  "database": "sys",
  "result": { "ok": 1 }
}
```

---

## 🌍 DEPLOYMENT STEPS

### STEP 1: Deploy Backend to Render

#### 1.1 Create Render Account
- Go to https://render.com
- Sign up with GitHub

#### 1.2 Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select the repository
4. Configure:
   - **Name:** bloodconnect-api
   - **Environment:** Node
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Instance Type:** Free

#### 1.3 Add Environment Variables
In Render dashboard, go to "Environment":

```
PORT=5000
NODE_ENV=production
DB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
DB_USER=EKBMzWXHKo28J9b.root
DB_PASSWORD=n8FlLrdof7QNiVMS
DB_NAME=sys
DB_PORT=4000
JWT_SECRET=your_production_secret_key_here
```

#### 1.4 Deploy
- Click "Create Web Service"
- Wait for deployment (2-3 minutes)
- Get your backend URL: `https://bloodconnect-api.onrender.com`

#### 1.5 Verify Backend
```bash
curl https://bloodconnect-api.onrender.com/api/health
curl https://bloodconnect-api.onrender.com/api/db/ping
```

---

### STEP 2: Deploy Frontend to Vercel

#### 2.1 Create Vercel Account
- Go to https://vercel.com
- Sign up with GitHub

#### 2.2 Import Project
1. Click "Add New..." → "Project"
2. Select your GitHub repository
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** ./client

#### 2.3 Add Environment Variables
In Vercel dashboard, go to "Settings" → "Environment Variables":

```
VITE_API_URL=https://bloodconnect-api.onrender.com
```

#### 2.4 Deploy
- Click "Deploy"
- Wait for deployment (1-2 minutes)
- Get your frontend URL: `https://bloodconnect.vercel.app`

#### 2.5 Verify Frontend
- Visit https://bloodconnect.vercel.app
- Check browser console for API connection

---

## ✅ POST-DEPLOYMENT VERIFICATION

### 1. Test API Endpoints

```bash
# Health check
curl https://bloodconnect-api.onrender.com/api/health

# Database connection
curl https://bloodconnect-api.onrender.com/api/db/ping

# Auth endpoints
curl -X POST https://bloodconnect-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "donor"
  }'
```

### 2. Test Frontend

1. Open https://bloodconnect.vercel.app
2. Try to register as a donor
3. Check browser DevTools → Network tab for API calls
4. Verify API calls go to Render backend

### 3. Monitor Logs

**Render Backend Logs:**
- Go to Render dashboard
- Select your service
- Click "Logs" tab
- Watch for connection messages

**Vercel Frontend Logs:**
- Go to Vercel dashboard
- Select your project
- Click "Deployments"
- View build logs

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong and unique in production
- [ ] Database credentials are in environment variables (not in code)
- [ ] SSL is enabled for TiDB connection
- [ ] CORS is properly configured
- [ ] API endpoints validate input
- [ ] Sensitive data is not logged
- [ ] Rate limiting is implemented (optional)

---

## 🐛 Troubleshooting

### Backend Won't Connect to TiDB

**Error:** `PROTOCOL_CONNECTION_LOST`

**Solution:**
1. Verify credentials in .env
2. Check TiDB Cloud IP whitelist
3. Ensure SSL is enabled in db.js
4. Test locally first

```bash
# Test connection locally
node -e "
import pool from './server/config/db.js';
const conn = await pool.getConnection();
console.log('Connected!');
conn.release();
"
```

### Frontend Can't Reach Backend

**Error:** `CORS error` or `Failed to fetch`

**Solution:**
1. Verify VITE_API_URL in Vercel environment
2. Check CORS settings in Express
3. Ensure backend is running
4. Check browser console for exact error

### Render Service Keeps Restarting

**Error:** Service crashes after deployment

**Solution:**
1. Check Render logs for errors
2. Verify all environment variables are set
3. Ensure database connection is working
4. Check for syntax errors in code

---

## 📊 Monitoring & Maintenance

### Daily Checks
- [ ] Backend health: `/api/health`
- [ ] Database connection: `/api/db/ping`
- [ ] Check Render logs for errors
- [ ] Monitor Vercel build status

### Weekly Tasks
- [ ] Review error logs
- [ ] Check database performance
- [ ] Update dependencies (if needed)
- [ ] Backup database (if applicable)

### Monthly Tasks
- [ ] Security audit
- [ ] Performance optimization
- [ ] Update documentation
- [ ] Review user feedback

---

## 🚀 Scaling Considerations

### When to Upgrade

**Backend (Render):**
- Current: Free tier (0.5 CPU, 512MB RAM)
- Upgrade to: Starter ($7/month) when:
  - Consistent traffic > 100 requests/min
  - Response times > 1 second
  - Memory usage > 400MB

**Database (TiDB):**
- Current: Free tier
- Upgrade to: Paid tier when:
  - Storage > 5GB
  - Concurrent connections > 50
  - Need higher performance

**Frontend (Vercel):**
- Current: Free tier (unlimited)
- Upgrade to: Pro ($20/month) when:
  - Need advanced analytics
  - Need custom domains
  - Need priority support

---

## 📝 Environment Variables Reference

### Backend (.env)

| Variable | Example | Purpose |
|----------|---------|---------|
| PORT | 5000 | Server port |
| NODE_ENV | production | Environment mode |
| DB_HOST | gateway01.us-east-1.prod.aws.tidbcloud.com | Database host |
| DB_USER | EKBMzWXHKo28J9b.root | Database user |
| DB_PASSWORD | n8FlLrdof7QNiVMS | Database password |
| DB_NAME | sys | Database name |
| DB_PORT | 4000 | Database port |
| JWT_SECRET | your_secret_key | JWT signing key |

### Frontend (.env.local / Vercel)

| Variable | Example | Purpose |
|----------|---------|---------|
| VITE_API_URL | https://bloodconnect-api.onrender.com | Backend API URL |

---

## 🎯 Success Criteria

✅ Backend deployed and running on Render
✅ Frontend deployed and running on Vercel
✅ Database connected via TiDB Cloud
✅ API endpoints responding correctly
✅ Frontend can communicate with backend
✅ User registration working
✅ Donor/Hospital flows functional
✅ No console errors in browser
✅ No errors in Render logs
✅ SSL certificate valid

---

## 📞 Support & Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **TiDB Cloud Docs:** https://docs.pingcap.com/tidbcloud
- **Express.js Docs:** https://expressjs.com
- **React Docs:** https://react.dev

---

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

---

**Last Updated:** 2024
**Version:** 1.0.0
