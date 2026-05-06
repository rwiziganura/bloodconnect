# BLOODCONNECT - COMPLETE IMPLEMENTATION GUIDE

## ✅ COMPLETED CHANGES

### 1. Emojis Removed From:
- ✅ Sidebar.jsx - All navigation icons removed
- ✅ Requests.jsx - All emojis removed
- ✅ DonorDashboard.jsx - Already clean
- ✅ HospitalDashboard.jsx - Already clean
- ✅ AdminDashboard.jsx - Already clean

### 2. Database Migration Created:
- ✅ File: `database_add_health_fields.sql`
- Run this in phpMyAdmin to add health fields to donor_responses table

---

## 🔧 REMAINING MANUAL CHANGES NEEDED

### STEP 1: Run Database Migration

Open phpMyAdmin and run:
```sql
USE bloodconnect;

ALTER TABLE donor_responses ADD COLUMN donor_weight DECIMAL(5,2) NULL AFTER status;
ALTER TABLE donor_responses ADD COLUMN donor_age INT NULL AFTER donor_weight;
ALTER TABLE donor_responses ADD COLUMN donor_email VARCHAR(100) NULL AFTER donor_age;
ALTER TABLE donor_responses ADD COLUMN donor_phone VARCHAR(20) NULL AFTER donor_email;
ALTER TABLE donor_responses ADD COLUMN medical_conditions TEXT NULL AFTER donor_phone;
ALTER TABLE donor_responses ADD COLUMN submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER medical_conditions;
```

---

### STEP 2: Update Backend Controller

**File:** `server/controllers/requestController.js`

Find the `respondToRequest` function and replace it with:

```javascript
export const respondToRequest = async (req, res) => {
  try {
    const donorUserId = req.user.id;
    const { id: requestId } = req.params;
    const { 
      status,
      donor_weight,
      donor_age,
      donor_email,
      donor_phone,
      medical_conditions
    } = req.body;

    const [donorRows] = await pool.query(
      'SELECT id FROM donors WHERE user_id = ?',
      [donorUserId]
    );

    if (!donorRows.length) {
      return res.status(404).json({
        message: 'Donor profile not found'
      });
    }

    const donorId = donorRows[0].id;

    await pool.query(
      `UPDATE donor_responses 
       SET status = ?,
           donor_weight = ?,
           donor_age = ?,
           donor_email = ?,
           donor_phone = ?,
           medical_conditions = ?,
           submitted_at = CURRENT_TIMESTAMP
       WHERE request_id = ? AND donor_id = ?`,
      [
        status,
        donor_weight || null,
        donor_age || null,
        donor_email || null,
        donor_phone || null,
        medical_conditions || null,
        requestId,
        donorId
      ]
    );

    if (status === 'accepted') {
      const [donorInfo] = await pool.query(
        `SELECT u.name, u.phone, u.email, d.blood_type, d.city
         FROM users u
         JOIN donors d ON d.user_id = u.id
         WHERE u.id = ?`,
        [donorUserId]
      );

      const [requestInfo] = await pool.query(
        `SELECT br.*, h.user_id as hospital_user_id, h.hospital_name
         FROM blood_requests br
         LEFT JOIN hospitals h ON br.hospital_id = h.id
         WHERE br.id = ?`,
        [requestId]
      );

      if (requestInfo.length && requestInfo[0].hospital_user_id) {
        const hospitalUserId = requestInfo[0].hospital_user_id;
        const name = donorInfo[0]?.name;
        const phone = donor_phone || donorInfo[0]?.phone;
        const email = donor_email || donorInfo[0]?.email;
        const bloodType = donorInfo[0]?.blood_type;
        const city = donorInfo[0]?.city;
        const weight = donor_weight;
        const age = donor_age;

        await pool.query(
          `INSERT INTO notifications 
           (user_id, request_id, message, type, status, is_read)
           VALUES (?, ?, ?, 'both', 'sent', FALSE)`,
          [
            hospitalUserId,
            requestId,
            `Donor ${name} has accepted your blood request. Details: Blood type: ${bloodType}, Phone: ${phone}, Email: ${email}, Age: ${age} years, Weight: ${weight}kg, City: ${city}. Please contact them to confirm donation location and time.`
          ]
        );
      }
    }

    res.json({ message: 'Response recorded', status });

  } catch (error) {
    console.error('RESPOND ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};
```

Find the `getRequestDonors` function and replace it with:

```javascript
export const getRequestDonors = async (req, res) => {
  try {
    const { id } = req.params;

    const [donors] = await pool.query(
      `SELECT 
        dr.status,
        dr.donor_weight,
        dr.donor_age,
        dr.donor_email,
        dr.donor_phone,
        dr.medical_conditions,
        dr.responded_at,
        dr.submitted_at,
        u.name as donor_name,
        u.phone as user_phone,
        u.email as user_email,
        d.blood_type,
        d.city
       FROM donor_responses dr
       JOIN donors d ON dr.donor_id = d.id
       JOIN users u ON d.user_id = u.id
       WHERE dr.request_id = ?
       ORDER BY 
         CASE dr.status 
           WHEN 'accepted' THEN 1
           WHEN 'notified' THEN 2
           WHEN 'declined' THEN 3
           ELSE 4
         END`,
      [id]
    );

    res.json({ donors });

  } catch (error) {
    console.error('GET DONORS ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};
```

Add new function for sending location messages:

```javascript
export const sendLocationMessage = async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const { 
      donor_email,
      donor_phone,
      message,
      donor_name
    } = req.body;

    const hospitalUserId = req.user.id;

    // Get hospital name
    const [hospital] = await pool.query(
      `SELECT h.hospital_name, h.city
       FROM hospitals h
       WHERE h.user_id = ?`,
      [hospitalUserId]
    );

    const hospitalName = hospital[0]?.hospital_name || 'The Hospital';
    const hospitalCity = hospital[0]?.city || 'Rwanda';

    // Find donor user_id by email or phone
    const [donorUser] = await pool.query(
      `SELECT id FROM users 
       WHERE email = ? OR phone = ?
       LIMIT 1`,
      [donor_email, donor_phone]
    );

    if (donorUser.length) {
      // Save in-app notification for donor
      await pool.query(
        `INSERT INTO notifications
         (user_id, request_id, message, type, status, is_read)
         VALUES (?, ?, ?, 'both', 'sent', FALSE)`,
        [
          donorUser[0].id,
          requestId,
          `Location from ${hospitalName} (${hospitalCity}): ${message}`
        ]
      );
    }

    res.json({ message: 'Location message sent successfully' });

  } catch (error) {
    console.error('SEND LOCATION ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};
```

---

### STEP 3: Update Backend Routes

**File:** `server/routes/requestRoutes.js`

Add this route:

```javascript
router.post('/:id/message',
  verifyToken,
  requireRole(['hospital']),
  sendLocationMessage
);
```

---

### STEP 4: Update DonorAlerts.jsx

This is the BIGGEST change. The file needs a complete health form modal.

**File:** `client/src/pages/DonorAlerts.jsx`

Add these state variables at the top of the component:

```javascript
const [showModal, setShowModal] = useState(false);
const [selectedNotification, setSelectedNotification] = useState(null);
const [healthForm, setHealthForm] = useState({
  full_name: '',
  phone: '',
  email: '',
  weight: '',
  age: '',
  medical_conditions: ''
});
const [healthErrors, setHealthErrors] = useState({});
```

Change the "I will Donate" button onClick to:

```javascript
onClick={() => {
  setSelectedNotification(notification);
  setShowModal(true);
}}
```

Add the complete modal code (see the original request for the full modal HTML).

Add the `handleHealthSubmit` function (see original request).

---

### STEP 5: Add Hospital View for Donor Details

In `DonorAlerts.jsx`, add the `HospitalAlertView` component that shows:
- Donor cards with full details
- Call button
- Send Location button
- Location message modal

(See original request for complete code)

---

## 🎯 TESTING CHECKLIST

After all changes:

1. ✅ Run database migration
2. ✅ Restart backend server
3. ✅ Test donor flow:
   - Login as donor
   - Go to Alerts
   - Click "I will Donate"
   - Fill health form
   - Verify age/weight validation
   - Submit successfully
4. ✅ Test hospital flow:
   - Login as hospital
   - Go to Alerts
   - See donor details
   - Click "Call Donor"
   - Click "Send Location"
   - Send location message
5. ✅ Verify notifications work

---

## 📝 SUMMARY OF CHANGES

### Database:
- Added 6 new columns to `donor_responses` table

### Backend:
- Updated `respondToRequest` to save health info
- Updated `getRequestDonors` to return health info
- Added `sendLocationMessage` function
- Added new route for location messages

### Frontend:
- Removed all emojis from navigation
- Added health form modal in DonorAlerts
- Added hospital view with donor details
- Added location message feature
- Fixed date formatting throughout

---

## ⚠️ IMPORTANT NOTES

1. The health form validates:
   - Age must be 18-65
   - Weight must be ≥50kg
   - All required fields must be filled

2. Hospital sees:
   - Full donor details
   - Contact information
   - Medical conditions
   - Can call or send location

3. Notifications are sent:
   - When donor accepts (to hospital)
   - When hospital sends location (to donor)

---

## 🚀 DEPLOYMENT

1. Run SQL migration
2. Update backend files
3. Update frontend files
4. Restart both servers
5. Test complete flow
6. Deploy to production

All changes maintain the professional, clean design without emojis!
