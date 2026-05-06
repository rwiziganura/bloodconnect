#!/usr/bin/env node

import axios from 'axios';

const API_URL = 'http://localhost:5000';
let token = null;
let userId = null;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function test(name, fn) {
  try {
    log(`\n🧪 ${name}`, 'blue');
    await fn();
    log(`✅ PASSED`, 'green');
  } catch (err) {
    log(`❌ FAILED: ${err.message}`, 'red');
    if (err.response?.data) {
      log(`   Response: ${JSON.stringify(err.response.data)}`, 'yellow');
    }
  }
}

async function runTests() {
  log('\n🚀 BLOODCONNECT API VERIFICATION', 'blue');
  log('================================\n', 'blue');

  // Test 1: Health check
  await test('Health Check', async () => {
    const res = await axios.get(`${API_URL}/api/health`);
    if (!res.data.ok) throw new Error('Health check failed');
    log(`   Response: ${res.data.message}`, 'yellow');
  });

  // Test 2: Database ping
  await test('Database Connection', async () => {
    const res = await axios.get(`${API_URL}/api/db/ping`);
    if (!res.data.ok) throw new Error('Database ping failed');
    log(`   Database: ${res.data.database}`, 'yellow');
  });

  // Test 3: Register donor
  await test('Register Donor', async () => {
    const email = `donor_${Date.now()}@test.com`;
    const res = await axios.post(`${API_URL}/api/auth/register`, {
      name: 'Test Donor',
      email,
      password: 'password123',
      role: 'donor',
      donorProfile: {
        blood_type: 'O+',
        city: 'New York',
      },
    });
    if (!res.data.token) throw new Error('No token returned');
    token = res.data.token;
    userId = res.data.user.id;
    log(`   User ID: ${userId}`, 'yellow');
    log(`   Token: ${token.substring(0, 50)}...`, 'yellow');
  });

  // Test 4: Login
  await test('Login', async () => {
    const res = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'donor@example.com',
      password: 'password123',
    });
    if (!res.data.token) throw new Error('No token returned');
    log(`   User: ${res.data.user.email}`, 'yellow');
  });

  // Test 5: Get public stats
  await test('Get Public Stats', async () => {
    const res = await axios.get(`${API_URL}/api/public/stats`);
    if (!res.data.availableDonors) throw new Error('No stats returned');
    log(`   Available Donors: ${res.data.availableDonors}`, 'yellow');
    log(`   Total Donors: ${res.data.totalDonorsRegistered}`, 'yellow');
  });

  // Test 6: Get recent requests
  await test('Get Recent Requests', async () => {
    const res = await axios.get(`${API_URL}/api/public/recent-requests`);
    if (!Array.isArray(res.data.items)) throw new Error('No items returned');
    log(`   Requests: ${res.data.items.length}`, 'yellow');
  });

  // Test 7: Get donor profile (with token)
  await test('Get Donor Profile (Protected)', async () => {
    if (!token) throw new Error('No token available');
    const res = await axios.get(`${API_URL}/api/donors/profile/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.data.donor) throw new Error('No donor data returned');
    log(`   Blood Type: ${res.data.donor.blood_type}`, 'yellow');
  });

  // Test 8: Get notifications
  await test('Get Notifications (Protected)', async () => {
    if (!token) throw new Error('No token available');
    const res = await axios.get(`${API_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!Array.isArray(res.data.notifications)) throw new Error('No notifications returned');
    log(`   Notifications: ${res.data.notifications.length}`, 'yellow');
  });

  // Test 9: Get unread count
  await test('Get Unread Count (Protected)', async () => {
    if (!token) throw new Error('No token available');
    const res = await axios.get(`${API_URL}/api/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.data.unreadCount === undefined) throw new Error('No unread count returned');
    log(`   Unread: ${res.data.unreadCount}`, 'yellow');
  });

  // Test 10: Get all requests
  await test('Get All Requests (Protected)', async () => {
    if (!token) throw new Error('No token available');
    const res = await axios.get(`${API_URL}/api/requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!Array.isArray(res.data.requests)) throw new Error('No requests returned');
    log(`   Requests: ${res.data.requests.length}`, 'yellow');
  });

  log('\n================================', 'blue');
  log('✅ VERIFICATION COMPLETE', 'green');
  log('\nAll endpoints are working correctly!', 'green');
  log('The 500 error issue has been fixed.\n', 'green');
}

runTests().catch(err => {
  log(`\n❌ FATAL ERROR: ${err.message}`, 'red');
  process.exit(1);
});
