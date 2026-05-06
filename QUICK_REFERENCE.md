# 🚀 BloodConnect - Quick Reference Guide

## 📍 Quick Links

| Resource | Link |
|----------|------|
| **Project Overview** | [README.md](./README.md) |
| **Deployment Guide** | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) |
| **Testing Guide** | [TESTING_GUIDE.md](./TESTING_GUIDE.md) |
| **Project Summary** | [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) |
| **Implementation Guide** | [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) |

---

## ⚡ Quick Start (5 minutes)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/bloodconnect.git
cd bloodconnect

# Windows
setup.bat

# Linux/Mac
bash setup.sh
```

### 2. Start Development
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

### 3. Access Application
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api/health

---

## 🔑 Environment Variables

### Backend (.env)
```
PORT=5000
DB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
DB_USER=EKBMzWXHKo28J9b.root
DB_PASSWORD=n8FlLrdof7QNiVMS
DB_NAME=sys
DB_PORT=4000
JWT_SECRET=your_secret_key
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000
```

---

## 📊 Database Connection

### TiDB Cloud Credentials
```
Host: gateway01.us-east-1.prod.aws.tidbcloud.com
Port: 4000
User: EKBMzWXHKo28J9b.root
Password: n8FlLrdof7QNiVMS
Database: sys
SSL: Enabled
```

### Test Connection
```bash
curl http://localhost:5000/api/db/ping
```

---

## 🔌 Key API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
```

### Donors
```
GET    /api/donors
POST   /api/donors
GET    /api/donors/:id
PUT    /api/donors/:id
```

### Hospitals
```
GET    /api/hospitals
POST   /api/hospitals
GET    /api/hospitals/:id
PUT    /api/hospitals/:id
```

### Blood Requests
```
GET    /api/requests
POST   /api/requests
GET    /api/requests/:id
POST   /api/requests/:id/respond
GET    /api/requests/:id/donors
```

### Notifications
```
GET    /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/mark-all-read
```

---

## 🧪 Quick Test Commands

### Register Donor
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Donor",
    "email": "john@example.com",
    "password": "password123",
    "role": "donor"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Blood Request
```bash
curl -X POST http://localhost:5000/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "blood_type": "O+",
    "quantity_units": 2,
    "urgency": "high",
    "notes": "Emergency"
  }'
```

---

## 📁 Project Structure

```
bloodconnect/
├── client/              # React Frontend
├── server/              # Node.js Backend
├── README.md            # Project overview
├── DEPLOYMENT_GUIDE.md  # Deployment instructions
├── TESTING_GUIDE.md     # Testing procedures
├── PROJECT_SUMMARY.md   # Complete summary
└── setup.sh/setup.bat   # Setup scripts
```

---

## 🚀 Deployment URLs

### Development
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Production
- Frontend: https://bloodconnect.vercel.app
- Backend: https://bloodconnect-api.onrender.com
- Database: gateway01.us-east-1.prod.aws.tidbcloud.com:4000

---

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| **Donor** | Register, view requests, accept/decline, update profile |
| **Hospital** | Create requests, view donors, manage requests |
| **Admin** | Manage users, verify hospitals, view statistics |

---

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| users | User accounts |
| donors | Donor profiles |
| hospitals | Hospital profiles |
| blood_requests | Blood requests |
| donor_responses | Donor responses to requests |
| notifications | User notifications |

---

## 🛠️ Common Commands

### Backend
```bash
cd server
npm install          # Install dependencies
npm run dev          # Start development server
npm start            # Start production server
npm test             # Run tests
```

### Frontend
```bash
cd client
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check if port 5000 is in use
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process and restart
npm run dev
```

### Database Connection Failed
```bash
# Test connection
curl http://localhost:5000/api/db/ping

# Check .env file
cat server/.env

# Verify credentials
# Host: gateway01.us-east-1.prod.aws.tidbcloud.com
# Port: 4000
# SSL: Enabled
```

### Frontend Can't Reach Backend
```bash
# Check VITE_API_URL
cat client/.env.local

# Should be: http://localhost:5000

# Check backend is running
curl http://localhost:5000/api/health
```

---

## 📈 Performance Tips

### Backend
- Use connection pooling (already configured)
- Cache frequently accessed data
- Optimize database queries
- Monitor response times

### Frontend
- Use code splitting
- Lazy load components
- Optimize images
- Minimize bundle size

### Database
- Add indexes on frequently queried columns
- Archive old data
- Monitor query performance
- Regular backups

---

## 🔒 Security Checklist

- [x] Passwords hashed with bcryptjs
- [x] JWT tokens for authentication
- [x] CORS properly configured
- [x] SQL injection prevention
- [x] XSS protection
- [x] SSL/TLS encryption
- [x] Environment variables protected
- [x] Input validation

---

## 📞 Support Resources

| Resource | URL |
|----------|-----|
| React Docs | https://react.dev |
| Express Docs | https://expressjs.com |
| TiDB Docs | https://docs.pingcap.com/tidbcloud |
| Render Docs | https://render.com/docs |
| Vercel Docs | https://vercel.com/docs |

---

## 🎯 Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature
```

### 2. Make Changes
```bash
# Edit files
# Test locally
npm run dev
```

### 3. Commit Changes
```bash
git add .
git commit -m "Add your feature"
```

### 4. Push to GitHub
```bash
git push origin feature/your-feature
```

### 5. Create Pull Request
- Go to GitHub
- Create PR with description
- Wait for review
- Merge when approved

---

## 📋 Deployment Checklist

Before deploying:
- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables set
- [ ] Database connection verified
- [ ] API endpoints tested
- [ ] Frontend builds successfully
- [ ] Security measures in place
- [ ] Documentation updated

---

## 🎓 Learning Path

### Week 1: Setup & Basics
- [ ] Clone repository
- [ ] Understand project structure
- [ ] Run locally
- [ ] Read documentation

### Week 2: Frontend Development
- [ ] Learn React components
- [ ] Understand routing
- [ ] Study API integration
- [ ] Build UI components

### Week 3: Backend Development
- [ ] Learn Express.js
- [ ] Understand authentication
- [ ] Study database queries
- [ ] Build API endpoints

### Week 4: Integration & Testing
- [ ] Connect frontend to backend
- [ ] Test all features
- [ ] Fix bugs
- [ ] Optimize performance

### Week 5: Deployment
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
- [ ] Configure environment variables
- [ ] Monitor production

---

## 💡 Tips & Tricks

### Development
- Use VS Code for better development experience
- Install REST Client extension for API testing
- Use browser DevTools for debugging
- Check console for errors

### Debugging
- Use `console.log()` for debugging
- Check network tab in DevTools
- Monitor server logs
- Use Postman for API testing

### Performance
- Use React DevTools Profiler
- Check Lighthouse scores
- Monitor database queries
- Optimize images

---

## 📞 Quick Contact

- **Issues:** GitHub Issues
- **Questions:** GitHub Discussions
- **Email:** support@bloodconnect.com
- **Slack:** #bloodconnect-dev

---

## 🎉 You're Ready!

You now have everything you need to:
- ✅ Develop new features
- ✅ Fix bugs
- ✅ Deploy to production
- ✅ Monitor performance
- ✅ Support users

**Happy coding! 🚀**

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** Production Ready ✅
