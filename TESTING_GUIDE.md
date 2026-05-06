# 🧪 BloodConnect Testing Guide

## Testing Overview

This guide covers manual testing procedures for the BloodConnect system.

---

## 🔧 Prerequisites

- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:5173`
- Database connected to TiDB Cloud
- Postman or curl installed (for API testing)

---

## 📋 Test Cases

### 1. AUTHENTICATION TESTS

#### 1.1 User Registration

**Test Case:** Register as Donor

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

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

**Test Case:** Register as Hospital

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "City Hospital",
    "email": "hospital@example.com",
    "password": "password123",
    "role": "hospital"
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "userId": 2
}
```

#### 1.2 User Login

**Test Case:** Login with Valid Credentials

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Donor",
    "email": "john@example.com",
    "role": "donor"
  }
}
```

**Test Case:** Login with Invalid Credentials

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "wrongpassword"
  }'
```

**Expected Response:**
```json
{
  "error": "Invalid email or password"
}
```

---

### 2. DONOR TESTS

#### 2.1 Create Donor Profile

**Test Case:** Add Donor Health Information

```bash
curl -X POST http://localhost:5000/api/donors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "blood_type": "O+",
    "age": 28,
    "weight": 75,
    "city": "Kigali",
    "location_lat": -1.9536,
    "location_lng": 29.8739,
    "is_available": true
  }'
```

**Expected Response:**
```json
{
  "message": "Donor profile created",
  "donorId": 1
}
```

#### 2.2 Get Donor Profile

```bash
curl -X GET http://localhost:5000/api/donors/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "donor": {
    "id": 1,
    "user_id": 1,
    "blood_type": "O+",
    "age": 28,
    "weight": 75,
    "city": "Kigali",
    "is_available": true
  }
}
```

#### 2.3 Update Donor Profile

```bash
curl -X PUT http://localhost:5000/api/donors/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "is_available": false
  }'
```

**Expected Response:**
```json
{
  "message": "Donor profile updated"
}
```

---

### 3. HOSPITAL TESTS

#### 3.1 Create Hospital Profile

```bash
curl -X POST http://localhost:5000/api/hospitals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "hospital_name": "City Hospital",
    "city": "Kigali",
    "address": "123 Main Street",
    "location_lat": -1.9536,
    "location_lng": 29.8739
  }'
```

**Expected Response:**
```json
{
  "message": "Hospital profile created",
  "hospitalId": 1
}
```

#### 3.2 Get Hospital Profile

```bash
curl -X GET http://localhost:5000/api/hospitals/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "hospital": {
    "id": 1,
    "user_id": 2,
    "hospital_name": "City Hospital",
    "city": "Kigali",
    "address": "123 Main Street",
    "is_approved": false
  }
}
```

---

### 4. BLOOD REQUEST TESTS

#### 4.1 Create Blood Request

**Test Case:** Hospital Creates Blood Request

```bash
curl -X POST http://localhost:5000/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer HOSPITAL_TOKEN" \
  -d '{
    "blood_type": "O+",
    "quantity_units": 2,
    "urgency": "high",
    "notes": "Emergency surgery needed",
    "patient_name": "Jane Doe",
    "contact_phone": "+250788123456"
  }'
```

**Expected Response:**
```json
{
  "donorsNotified": 5,
  "notifiedDonorIds": [1, 2, 3, 4, 5]
}
```

#### 4.2 Get All Blood Requests

```bash
curl -X GET http://localhost:5000/api/requests \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "requests": [
    {
      "id": 1,
      "hospital_id": 1,
      "blood_type": "O+",
      "quantity_units": 2,
      "urgency": "high",
      "status": "open",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### 4.3 Get Request Details

```bash
curl -X GET http://localhost:5000/api/requests/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "request": {
    "id": 1,
    "hospital_id": 1,
    "blood_type": "O+",
    "quantity_units": 2,
    "urgency": "high",
    "status": "open",
    "hospital_name": "City Hospital",
    "city": "Kigali"
  }
}
```

---

### 5. DONOR RESPONSE TESTS

#### 5.1 Accept Blood Request

**Test Case:** Donor Accepts Request

```bash
curl -X POST http://localhost:5000/api/requests/1/respond \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DONOR_TOKEN" \
  -d '{
    "status": "accepted",
    "donor_weight": 75,
    "donor_age": 28,
    "donor_email": "john@example.com",
    "donor_phone": "+250788123456",
    "medical_conditions": "None"
  }'
```

**Expected Response:**
```json
{
  "message": "Response recorded",
  "status": "accepted"
}
```

#### 5.2 Decline Blood Request

**Test Case:** Donor Declines Request

```bash
curl -X POST http://localhost:5000/api/requests/1/respond \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DONOR_TOKEN" \
  -d '{
    "status": "declined"
  }'
```

**Expected Response:**
```json
{
  "message": "Response recorded",
  "status": "declined"
}
```

---

### 6. NOTIFICATION TESTS

#### 6.1 Get User Notifications

```bash
curl -X GET http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "notifications": [
    {
      "id": 1,
      "user_id": 1,
      "message": "Blood request for O+ at City Hospital",
      "type": "blood_request",
      "is_read": false,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "unreadCount": 1
}
```

#### 6.2 Mark Notification as Read

```bash
curl -X PUT http://localhost:5000/api/notifications/1/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "message": "Notification marked as read"
}
```

#### 6.3 Mark All Notifications as Read

```bash
curl -X PUT http://localhost:5000/api/notifications/mark-all-read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "message": "All notifications marked as read"
}
```

---

### 7. DATABASE CONNECTION TESTS

#### 7.1 Health Check

```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "ok": true,
  "message": "BloodConnect API is running"
}
```

#### 7.2 Database Ping

```bash
curl http://localhost:5000/api/db/ping
```

**Expected Response:**
```json
{
  "ok": true,
  "database": "sys",
  "result": {
    "ok": 1
  }
}
```

---

## 🎯 Frontend Testing Checklist

### Registration Page
- [ ] Can register as donor
- [ ] Can register as hospital
- [ ] Email validation works
- [ ] Password validation works
- [ ] Error messages display correctly
- [ ] Success message shows after registration

### Login Page
- [ ] Can login with valid credentials
- [ ] Error message shows for invalid credentials
- [ ] Token is stored in localStorage
- [ ] Redirects to dashboard after login

### Donor Dashboard
- [ ] Can view blood requests
- [ ] Can accept blood request
- [ ] Can decline blood request
- [ ] Health form displays correctly
- [ ] Can submit health information
- [ ] Notifications display correctly

### Hospital Dashboard
- [ ] Can create blood request
- [ ] Can view donor responses
- [ ] Can see donor health details
- [ ] Can contact donors
- [ ] Request status updates correctly

### Notifications
- [ ] Notifications display in real-time
- [ ] Can mark as read
- [ ] Can mark all as read
- [ ] Unread count updates correctly

---

## 🔍 Error Handling Tests

### Test Invalid Input

```bash
# Missing required field
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Donor",
    "email": "john@example.com"
  }'
```

**Expected:** 400 Bad Request with error message

### Test Unauthorized Access

```bash
curl -X GET http://localhost:5000/api/donors/1
```

**Expected:** 401 Unauthorized

### Test Invalid Token

```bash
curl -X GET http://localhost:5000/api/donors/1 \
  -H "Authorization: Bearer invalid_token"
```

**Expected:** 401 Unauthorized

---

## 📊 Performance Tests

### Load Testing

Use Apache Bench or similar tool:

```bash
ab -n 100 -c 10 http://localhost:5000/api/health
```

**Expected:** Response time < 100ms

### Database Query Performance

Monitor query execution time in server logs.

**Expected:** Query time < 500ms

---

## 🐛 Bug Reporting Template

When reporting bugs, include:

```
**Title:** Brief description of the bug

**Environment:**
- OS: Windows/Mac/Linux
- Browser: Chrome/Firefox/Safari
- Node version: 16.x.x
- npm version: 8.x.x

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Screenshots:**
[If applicable]

**Console Errors:**
[Paste any error messages]

**Additional Context:**
Any other relevant information
```

---

## ✅ Sign-Off Checklist

Before deployment, verify:

- [ ] All authentication tests pass
- [ ] All donor tests pass
- [ ] All hospital tests pass
- [ ] All blood request tests pass
- [ ] All notification tests pass
- [ ] Database connection is stable
- [ ] No console errors in browser
- [ ] No errors in server logs
- [ ] API response times are acceptable
- [ ] Frontend UI is responsive
- [ ] All forms validate correctly
- [ ] Error handling works properly

---

## 📞 Support

For testing issues or questions, contact the development team.

---

**Last Updated:** 2024
**Version:** 1.0.0
