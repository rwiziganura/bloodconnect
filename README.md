# 🩸 BloodConnect - Full-Stack Blood Donation System

A modern, full-stack blood donation management system connecting donors with hospitals in need of blood donations.

## 🌟 Features

### For Donors
- ✅ User registration and authentication
- ✅ Donor profile management
- ✅ Blood type and health information
- ✅ Location-based donor discovery
- ✅ Accept/decline blood requests
- ✅ Donation history tracking
- ✅ Real-time notifications

### For Hospitals
- ✅ Hospital registration and verification
- ✅ Create blood requests
- ✅ View available donors
- ✅ Approve/reject donor responses
- ✅ Manage donation locations
- ✅ Track request status
- ✅ Donor contact information

### Admin Features
- ✅ User management
- ✅ Hospital verification
- ✅ System statistics
- ✅ Request monitoring
- ✅ Donor analytics

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation
- **Leaflet** - Maps integration

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MySQL2/Promise** - Database driver
- **JWT** - Authentication
- **CORS** - Cross-origin requests
- **Dotenv** - Environment variables

### Database
- **TiDB Cloud** - MySQL-compatible cloud database
- **SSL/TLS** - Secure connections

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **TiDB Cloud** - Database hosting

## 📋 Prerequisites

- Node.js 16 or higher
- npm or yarn
- Git
- TiDB Cloud account (credentials provided)

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/bloodconnect.git
cd bloodconnect
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file:
```
PORT=5000
NODE_ENV=development
DB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
DB_USER=EKBMzWXHKo28J9b.root
DB_PASSWORD=n8FlLrdof7QNiVMS
DB_NAME=sys
DB_PORT=4000
JWT_SECRET=your_secret_key_here
```

Start backend:
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd client
npm install
```

Create `.env.local` file:
```
VITE_API_URL=http://localhost:5000
```

Start frontend:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Test Connection

```bash
# Test backend health
curl http://localhost:5000/api/health

# Test database connection
curl http://localhost:5000/api/db/ping
```

## 📁 Project Structure

```
bloodconnect/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/             # Reusable components
│   │   ├── context/                # React context (Auth, Alerts)
│   │   ├── pages/                  # Page components
│   │   ├── services/               # API services
│   │   ├── App.jsx                 # Main app component
│   │   └── main.jsx                # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Node.js backend
│   ├── config/
│   │   └── db.js                   # Database configuration
│   ├── controllers/                # Route handlers
│   ├── middleware/                 # Auth, role middleware
│   ├── routes/                     # API routes
│   ├── utils/                      # Helper functions
│   ├── server.js                   # Express app
│   ├── package.json
│   └── .env                        # Environment variables
│
├── DEPLOYMENT_GUIDE.md             # Deployment instructions
├── .env.example                    # Example env variables
└── README.md                       # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Donors
- `GET /api/donors` - Get all donors
- `GET /api/donors/:id` - Get donor details
- `PUT /api/donors/:id` - Update donor profile
- `POST /api/donors/accept` - Accept blood request

### Hospitals
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/:id` - Get hospital details
- `POST /api/hospitals` - Create hospital
- `PUT /api/hospitals/:id` - Update hospital

### Blood Requests
- `GET /api/requests` - Get all requests
- `POST /api/requests` - Create blood request
- `GET /api/requests/:id` - Get request details
- `PUT /api/requests/:id` - Update request status
- `POST /api/requests/:id/respond` - Respond to request

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) for authentication:

1. User registers with email and password
2. Password is hashed with bcryptjs
3. JWT token is issued on login
4. Token is stored in localStorage
5. Token is sent in Authorization header for protected routes

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('donor', 'hospital', 'admin'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Donors Table
```sql
CREATE TABLE donors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  blood_type VARCHAR(5),
  age INT,
  weight DECIMAL(5,2),
  city VARCHAR(255),
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Hospitals Table
```sql
CREATE TABLE hospitals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  hospital_name VARCHAR(255),
  city VARCHAR(255),
  address VARCHAR(255),
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Blood Requests Table
```sql
CREATE TABLE blood_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  hospital_id INT,
  requester_id INT,
  blood_type VARCHAR(5) NOT NULL,
  quantity_units INT,
  urgency ENUM('low', 'medium', 'high', 'critical'),
  status ENUM('open', 'fulfilled', 'cancelled'),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  FOREIGN KEY (requester_id) REFERENCES users(id)
);
```

## 🌐 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deployment Summary

1. **Backend to Render:**
   - Connect GitHub repository
   - Set environment variables
   - Deploy

2. **Frontend to Vercel:**
   - Import project
   - Set environment variables
   - Deploy

3. **Database:**
   - Already configured on TiDB Cloud
   - No additional setup needed

## 🧪 Testing

### Test User Accounts

**Donor Account:**
- Email: `donor@example.com`
- Password: `password123`
- Role: Donor

**Hospital Account:**
- Email: `hospital@example.com`
- Password: `password123`
- Role: Hospital

**Admin Account:**
- Email: `admin@example.com`
- Password: `password123`
- Role: Admin

## 📊 System Flow

### Donor Registration Flow
1. Donor registers with email and password
2. Donor profile is created
3. Donor enters blood type and health info
4. Donor location is captured
5. Donor becomes available for requests

### Blood Request Flow
1. Hospital creates blood request
2. System finds matching donors nearby
3. Donors receive notifications
4. Donor accepts/declines request
5. Hospital is notified of response
6. Donation is scheduled

### Donation Completion Flow
1. Donor arrives at hospital
2. Health checks are performed
3. Blood is collected
4. Request status is updated
5. Donor receives confirmation

## 🐛 Troubleshooting

### Backend Connection Issues

**Problem:** Cannot connect to TiDB Cloud

**Solution:**
1. Verify credentials in `.env`
2. Check internet connection
3. Ensure SSL is enabled
4. Test with: `curl http://localhost:5000/api/db/ping`

### Frontend API Errors

**Problem:** Frontend cannot reach backend

**Solution:**
1. Verify `VITE_API_URL` is correct
2. Check backend is running
3. Check browser console for CORS errors
4. Verify firewall settings

### Authentication Issues

**Problem:** Cannot login or register

**Solution:**
1. Check database connection
2. Verify JWT_SECRET is set
3. Check email format
4. Verify password requirements

## 📈 Performance Optimization

- Database connection pooling (10 connections)
- JWT token caching
- API response compression
- Frontend code splitting
- Image optimization
- CSS minification

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- CORS protection
- SQL injection prevention
- XSS protection
- SSL/TLS encryption
- Environment variable protection

## 📝 API Documentation

Detailed API documentation is available in the backend routes:

- `/server/routes/authRoutes.js` - Authentication endpoints
- `/server/routes/donorRoutes.js` - Donor endpoints
- `/server/routes/hospitalRoutes.js` - Hospital endpoints
- `/server/routes/requestRoutes.js` - Request endpoints
- `/server/routes/notificationRoutes.js` - Notification endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Frontend Developer:** React specialist
- **Backend Developer:** Node.js specialist
- **Database Admin:** TiDB Cloud specialist
- **DevOps:** Deployment specialist

## 📞 Support

For support, email support@bloodconnect.com or open an issue on GitHub.

## 🙏 Acknowledgments

- TiDB Cloud for database hosting
- Render for backend hosting
- Vercel for frontend hosting
- React community
- Express.js community

## 📚 Resources

- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [TiDB Cloud Documentation](https://docs.pingcap.com/tidbcloud)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Production Ready ✅
