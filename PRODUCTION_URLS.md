# 🔗 BloodConnect - Production URLs & Credentials

## 🌐 Live URLs

### Frontend (Vercel)
- **Production**: https://bloodconnect.vercel.app
- **Preview**: Auto-generated for each PR

### Backend (Render)
- **API Base**: https://bloodconnect-zptd.onrender.com
- **API Endpoints**: https://bloodconnect-zptd.onrender.com/api
- **Health Check**: https://bloodconnect-zptd.onrender.com/api/health
- **DB Ping**: https://bloodconnect-zptd.onrender.com/api/db/ping

### Database (TiDB Cloud)
- **Host**: gateway01.us-east-1.prod.aws.tidbcloud.com
- **Port**: 4000
- **Database**: bloodconnect
- **User**: EKBMzWXHKo28J9b.root
- **Password**: 7gclHJOSmiDKWKLa

## 🔑 Environment Variables

### Frontend (.env.production)
```env
VITE_API_URL=https://bloodconnect-zptd.onrender.com/api
```

### Backend (Render Environment Variables)
```env
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

## 🧪 Quick Test Commands

### Test Backend Health
```bash
curl https://bloodconnect-zptd.onrender.com/api/health
```

### Test Database Connection
```bash
curl https://bloodconnect-zptd.onrender.com/api/db/ping
```

### Test Registration (POST)
```bash
curl -X POST https://bloodconnect-zptd.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","role":"donor","donorProfile":{"blood_type":"O+","city":"Kigali"}}'
```

### Test Login (POST)
```bash
curl -X POST https://bloodconnect-zptd.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## 📊 Dashboard Links

### Render Dashboard
- **Service**: https://dashboard.render.com/
- **Logs**: https://dashboard.render.com/web/[service-id]/logs
- **Environment**: https://dashboard.render.com/web/[service-id]/env

### Vercel Dashboard
- **Project**: https://vercel.com/dashboard
- **Deployments**: https://vercel.com/[username]/bloodconnect/deployments
- **Settings**: https://vercel.com/[username]/bloodconnect/settings

### TiDB Cloud Dashboard
- **Console**: https://tidbcloud.com/console/clusters
- **Monitoring**: https://tidbcloud.com/console/clusters/[cluster-id]/monitoring

## 🔧 Local Development URLs

### Frontend (Vite Dev Server)
- **URL**: http://localhost:5173
- **API Proxy**: Configured in vite.config.js

### Backend (Express Server)
- **URL**: http://localhost:5000
- **API Base**: http://localhost:5000/api
- **Health**: http://localhost:5000/api/health

## 📝 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Donors
- `GET /api/donors/me/dashboard` - Get donor dashboard
- `GET /api/donors/me/alerts` - Get blood request alerts
- `GET /api/donors/me/history` - Get donation history
- `PUT /api/donors/me/availability` - Toggle availability
- `GET /api/donors/profile/me` - Get donor profile
- `PUT /api/donors/profile/me` - Update donor profile

### Hospitals
- `GET /api/hospitals/me/dashboard` - Get hospital dashboard
- `POST /api/hospitals/requests` - Create blood request
- `GET /api/hospitals/requests` - Get hospital requests

### Requests
- `GET /api/requests` - Get all blood requests
- `GET /api/requests/:id` - Get request details
- `POST /api/requests/:id/respond` - Respond to request

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

## 🚨 Troubleshooting Quick Fixes

### Frontend not connecting to backend
1. Check browser console for API Base URL log
2. Verify VITE_API_URL in Vercel environment variables
3. Rebuild and redeploy frontend

### Backend returning 500 errors
1. Check Render logs for error details
2. Verify database connection (test /api/db/ping)
3. Check environment variables are set correctly

### CORS errors
1. Verify frontend URL is in CORS allowedOrigins
2. Check FRONTEND_URL environment variable on Render
3. Ensure credentials: true in both CORS config and axios

### Database connection failed
1. Verify TiDB Cloud credentials
2. Check IP whitelist allows Render IPs
3. Test connection with mysql client

---

**Quick Start**: Copy environment variables → Deploy backend → Deploy frontend → Test endpoints
