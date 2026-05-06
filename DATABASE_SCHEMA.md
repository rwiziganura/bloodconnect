# 🗄️ BloodConnect - Complete Database Documentation

## 📊 Database Information

### Database Name
```
bloodconnect
```

### Database Connection (TiDB Cloud)
```
Host: gateway01.us-east-1.prod.aws.tidbcloud.com
Port: 4000
User: EKBMzWXHKo28J9b.root
Password: n8FlLrdof7QNiVMS
Database: sys (or bloodconnect for local)
SSL: Enabled
```

### Character Set
```
utf8mb4 (Unicode support)
Collation: utf8mb4_unicode_ci
```

---

## 📋 All Database Tables

### Total Tables: 7

1. **users** - User accounts
2. **donors** - Donor profiles
3. **hospitals** - Hospital profiles
4. **blood_requests** - Blood donation requests
5. **donor_responses** - Donor responses to requests
6. **notifications** - User notifications
7. **donor_acceptances** - Donor acceptance tracking (optional)

---

## 📑 Detailed Table Schemas

### 1. **users** Table

**Purpose:** Store user account information

**Columns:**
```sql
CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(32) DEFAULT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('donor', 'hospital', 'admin') NOT NULL DEFAULT 'donor',
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Column Details:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT UNSIGNED | No | AUTO_INCREMENT | Primary key |
| name | VARCHAR(255) | No | - | User full name |
| email | VARCHAR(255) | No | - | User email (unique) |
| phone | VARCHAR(32) | Yes | NULL | User phone number |
| password | VARCHAR(255) | No | - | Hashed password |
| role | ENUM | No | 'donor' | User role (donor/hospital/admin) |
| is_verified | TINYINT(1) | No | 0 | Email verification status |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | Account creation time |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE KEY: email

---

### 2. **donors** Table

**Purpose:** Store donor profile information

**Columns:**
```sql
CREATE TABLE donors (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
  city VARCHAR(128) NOT NULL,
  location_lat DECIMAL(10, 7) DEFAULT NULL,
  location_lng DECIMAL(10, 7) DEFAULT NULL,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  last_donation_date DATE DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_donors_user_id (user_id),
  CONSTRAINT fk_donors_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Column Details:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT UNSIGNED | No | AUTO_INCREMENT | Primary key |
| user_id | INT UNSIGNED | No | - | Foreign key to users |
| blood_type | ENUM | No | - | Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-) |
| city | VARCHAR(128) | No | - | Donor city |
| location_lat | DECIMAL(10,7) | Yes | NULL | Latitude coordinate |
| location_lng | DECIMAL(10,7) | Yes | NULL | Longitude coordinate |
| is_available | TINYINT(1) | No | 1 | Availability status |
| last_donation_date | DATE | Yes | NULL | Last donation date |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE KEY: user_id
- FOREIGN KEY: user_id → users.id

---

### 3. **hospitals** Table

**Purpose:** Store hospital profile information

**Columns:**
```sql
CREATE TABLE hospitals (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  hospital_name VARCHAR(255) NOT NULL,
  city VARCHAR(128) NOT NULL,
  address VARCHAR(255) DEFAULT NULL,
  location_lat DECIMAL(10, 7) DEFAULT NULL,
  location_lng DECIMAL(10, 7) DEFAULT NULL,
  is_approved TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_hospitals_user_id (user_id),
  CONSTRAINT fk_hospitals_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Column Details:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT UNSIGNED | No | AUTO_INCREMENT | Primary key |
| user_id | INT UNSIGNED | No | - | Foreign key to users |
| hospital_name | VARCHAR(255) | No | - | Hospital name |
| city | VARCHAR(128) | No | - | Hospital city |
| address | VARCHAR(255) | Yes | NULL | Hospital address |
| location_lat | DECIMAL(10,7) | Yes | NULL | Latitude coordinate |
| location_lng | DECIMAL(10,7) | Yes | NULL | Longitude coordinate |
| is_approved | TINYINT(1) | No | 0 | Hospital approval status |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE KEY: user_id
- FOREIGN KEY: user_id → users.id

---

### 4. **blood_requests** Table

**Purpose:** Store blood donation requests

**Columns:**
```sql
CREATE TABLE blood_requests (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  hospital_id INT UNSIGNED NULL DEFAULT NULL,
  request_type ENUM('hospital','personal') NOT NULL DEFAULT 'hospital',
  requester_id INT UNSIGNED NULL,
  blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
  quantity_units INT UNSIGNED NOT NULL DEFAULT 1,
  urgency ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  status ENUM('open', 'fulfilled', 'cancelled') NOT NULL DEFAULT 'open',
  notes TEXT DEFAULT NULL,
  patient_name VARCHAR(100) NULL,
  contact_phone VARCHAR(20) NULL,
  donors_notified_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_blood_requests_hospital (hospital_id),
  KEY idx_blood_requests_status (status),
  CONSTRAINT fk_blood_requests_hospital
    FOREIGN KEY (hospital_id) REFERENCES hospitals (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Column Details:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT UNSIGNED | No | AUTO_INCREMENT | Primary key |
| hospital_id | INT UNSIGNED | Yes | NULL | Foreign key to hospitals |
| request_type | ENUM | No | 'hospital' | Type of request (hospital/personal) |
| requester_id | INT UNSIGNED | Yes | NULL | Foreign key to users (for personal requests) |
| blood_type | ENUM | No | - | Blood type needed |
| quantity_units | INT UNSIGNED | No | 1 | Units of blood needed |
| urgency | ENUM | No | 'medium' | Urgency level (low/medium/high/critical) |
| status | ENUM | No | 'open' | Request status (open/fulfilled/cancelled) |
| notes | TEXT | Yes | NULL | Additional notes |
| patient_name | VARCHAR(100) | Yes | NULL | Patient name |
| contact_phone | VARCHAR(20) | Yes | NULL | Contact phone number |
| donors_notified_count | INT UNSIGNED | No | 0 | Number of donors notified |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | Request creation time |

**Indexes:**
- PRIMARY KEY: id
- KEY: hospital_id
- KEY: status
- FOREIGN KEY: hospital_id → hospitals.id

---

### 5. **donor_responses** Table

**Purpose:** Store donor responses to blood requests

**Columns:**
```sql
CREATE TABLE donor_responses (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  request_id INT UNSIGNED NOT NULL,
  donor_id INT UNSIGNED NOT NULL,
  status ENUM('pending', 'accepted', 'declined', 'completed') NOT NULL DEFAULT 'pending',
  donor_weight DECIMAL(5,2) NULL,
  donor_age INT NULL,
  donor_email VARCHAR(100) NULL,
  donor_phone VARCHAR(20) NULL,
  medical_conditions TEXT NULL,
  responded_at TIMESTAMP NULL DEFAULT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_donor_request (request_id, donor_id),
  KEY idx_donor_responses_donor (donor_id),
  CONSTRAINT fk_donor_responses_request
    FOREIGN KEY (request_id) REFERENCES blood_requests (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_donor_responses_donor
    FOREIGN KEY (donor_id) REFERENCES donors (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Column Details:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT UNSIGNED | No | AUTO_INCREMENT | Primary key |
| request_id | INT UNSIGNED | No | - | Foreign key to blood_requests |
| donor_id | INT UNSIGNED | No | - | Foreign key to donors |
| status | ENUM | No | 'pending' | Response status (pending/accepted/declined/completed) |
| donor_weight | DECIMAL(5,2) | Yes | NULL | Donor weight in kg |
| donor_age | INT | Yes | NULL | Donor age |
| donor_email | VARCHAR(100) | Yes | NULL | Donor email |
| donor_phone | VARCHAR(20) | Yes | NULL | Donor phone |
| medical_conditions | TEXT | Yes | NULL | Medical conditions |
| responded_at | TIMESTAMP | Yes | NULL | Response timestamp |
| submitted_at | TIMESTAMP | No | CURRENT_TIMESTAMP | Submission timestamp |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE KEY: (request_id, donor_id)
- KEY: donor_id
- FOREIGN KEY: request_id → blood_requests.id
- FOREIGN KEY: donor_id → donors.id

---

### 6. **notifications** Table

**Purpose:** Store user notifications

**Columns:**
```sql
CREATE TABLE notifications (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  request_id INT UNSIGNED NULL,
  message TEXT NOT NULL,
  type VARCHAR(64) NOT NULL DEFAULT 'info',
  status ENUM('unread', 'read') NOT NULL DEFAULT 'unread',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user (user_id),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Column Details:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT UNSIGNED | No | AUTO_INCREMENT | Primary key |
| user_id | INT UNSIGNED | No | - | Foreign key to users |
| request_id | INT UNSIGNED | Yes | NULL | Foreign key to blood_requests |
| message | TEXT | No | - | Notification message |
| type | VARCHAR(64) | No | 'info' | Notification type |
| status | ENUM | No | 'unread' | Status (unread/read) |
| is_read | BOOLEAN | No | FALSE | Read flag |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | Creation timestamp |

**Indexes:**
- PRIMARY KEY: id
- KEY: user_id
- FOREIGN KEY: user_id → users.id

---

### 7. **donor_acceptances** Table (Optional)

**Purpose:** Track donor acceptances with appointment details

**Columns:**
```sql
CREATE TABLE donor_acceptances (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  request_id INT UNSIGNED NOT NULL,
  donor_id INT UNSIGNED NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  email VARCHAR(255) NOT NULL,
  age INT UNSIGNED NOT NULL,
  weight DECIMAL(5, 2) NOT NULL,
  blood_type VARCHAR(10) NOT NULL,
  last_donation_date DATE DEFAULT NULL,
  medical_conditions TEXT DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  rejection_reason TEXT DEFAULT NULL,
  appointment_location VARCHAR(255) DEFAULT NULL,
  appointment_date DATE DEFAULT NULL,
  appointment_time TIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_donor_acceptances_request (request_id),
  KEY idx_donor_acceptances_donor (donor_id),
  KEY idx_donor_acceptances_status (status),
  CONSTRAINT fk_donor_acceptances_request
    FOREIGN KEY (request_id) REFERENCES blood_requests (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_donor_acceptances_donor
    FOREIGN KEY (donor_id) REFERENCES donors (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Column Details:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT UNSIGNED | No | AUTO_INCREMENT | Primary key |
| request_id | INT UNSIGNED | No | - | Foreign key to blood_requests |
| donor_id | INT UNSIGNED | Yes | NULL | Foreign key to donors |
| full_name | VARCHAR(255) | No | - | Donor full name |
| phone | VARCHAR(32) | No | - | Donor phone |
| email | VARCHAR(255) | No | - | Donor email |
| age | INT UNSIGNED | No | - | Donor age |
| weight | DECIMAL(5,2) | No | - | Donor weight |
| blood_type | VARCHAR(10) | No | - | Blood type |
| last_donation_date | DATE | Yes | NULL | Last donation date |
| medical_conditions | TEXT | Yes | NULL | Medical conditions |
| status | VARCHAR(20) | No | 'pending' | Acceptance status |
| rejection_reason | TEXT | Yes | NULL | Rejection reason |
| appointment_location | VARCHAR(255) | Yes | NULL | Appointment location |
| appointment_date | DATE | Yes | NULL | Appointment date |
| appointment_time | TIME | Yes | NULL | Appointment time |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY: id
- KEY: request_id
- KEY: donor_id
- KEY: status
- FOREIGN KEY: request_id → blood_requests.id
- FOREIGN KEY: donor_id → donors.id

---

## 🔗 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         users                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ id (PK)                                              │   │
│  │ name                                                 │   │
│  │ email (UNIQUE)                                       │   │
│  │ phone                                                │   │
│  │ password                                             │   │
│  │ role (donor/hospital/admin)                          │   │
│  │ is_verified                                          │   │
│  │ created_at                                           │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────┬──────────────────────────────┬──────────────────┘
             │                              │
             │ 1:1                          │ 1:1
             ↓                              ↓
    ┌─────────────────┐          ┌──────────────────────┐
    │     donors      │          │    hospitals         │
    ├─────────────────┤          ├──────────────────────┤
    │ id (PK)         │          │ id (PK)              │
    │ user_id (FK)    │          │ user_id (FK)         │
    │ blood_type      │          │ hospital_name        │
    │ city            │          │ city                 │
    │ location_lat    │          │ address              │
    │ location_lng    │          │ location_lat         │
    │ is_available    │          │ location_lng         │
    │ last_donation   │          │ is_approved          │
    └────────┬────────┘          └──────────┬───────────┘
             │                              │
             │ 1:N                          │ 1:N
             │                              ↓
             │                   ┌──────────────────────┐
             │                   │  blood_requests      │
             │                   ├──────────────────────┤
             │                   │ id (PK)              │
             │                   │ hospital_id (FK)     │
             │                   │ request_type         │
             │                   │ requester_id (FK)    │
             │                   │ blood_type           │
             │                   │ quantity_units       │
             │                   │ urgency              │
             │                   │ status               │
             │                   │ notes                │
             │                   │ patient_name         │
             │                   │ contact_phone        │
             │                   │ donors_notified_count│
             │                   │ created_at           │
             │                   └──────────┬───────────┘
             │                              │
             │                              │ 1:N
             │                              ↓
             │                   ┌──────────────────────┐
             │                   │ donor_responses      │
             │                   ├──────────────────────┤
             │                   │ id (PK)              │
             │                   │ request_id (FK)      │
             │                   │ donor_id (FK)        │
             │                   │ status               │
             │                   │ donor_weight         │
             │                   │ donor_age            │
             │                   │ donor_email          │
             │                   │ donor_phone          │
             │                   │ medical_conditions   │
             │                   │ responded_at         │
             │                   │ submitted_at         │
             │                   └──────────────────────┘
             │
             └─────────────────────────────────────────┐
                                                       │
                                                       │ 1:N
                                                       ↓
                                            ┌──────────────────────┐
                                            │  notifications       │
                                            ├──────────────────────┤
                                            │ id (PK)              │
                                            │ user_id (FK)         │
                                            │ request_id (FK)      │
                                            │ message              │
                                            │ type                 │
                                            │ status               │
                                            │ is_read              │
                                            │ created_at           │
                                            └──────────────────────┘
```

---

## 📊 Table Relationships Summary

| From Table | To Table | Relationship | Foreign Key | Cascade |
|-----------|----------|--------------|-------------|---------|
| donors | users | 1:1 | user_id | CASCADE |
| hospitals | users | 1:1 | user_id | CASCADE |
| blood_requests | hospitals | 1:N | hospital_id | CASCADE |
| donor_responses | blood_requests | N:1 | request_id | CASCADE |
| donor_responses | donors | N:1 | donor_id | CASCADE |
| notifications | users | N:1 | user_id | CASCADE |
| donor_acceptances | blood_requests | N:1 | request_id | CASCADE |
| donor_acceptances | donors | N:1 | donor_id | SET NULL |

---

## 🔑 Primary Keys

| Table | Primary Key |
|-------|-------------|
| users | id |
| donors | id |
| hospitals | id |
| blood_requests | id |
| donor_responses | id |
| notifications | id |
| donor_acceptances | id |

---

## 🔗 Foreign Keys

| Table | Foreign Key | References | On Delete | On Update |
|-------|-------------|-----------|-----------|-----------|
| donors | user_id | users.id | CASCADE | CASCADE |
| hospitals | user_id | users.id | CASCADE | CASCADE |
| blood_requests | hospital_id | hospitals.id | CASCADE | CASCADE |
| donor_responses | request_id | blood_requests.id | CASCADE | CASCADE |
| donor_responses | donor_id | donors.id | CASCADE | CASCADE |
| notifications | user_id | users.id | CASCADE | CASCADE |
| donor_acceptances | request_id | blood_requests.id | CASCADE | CASCADE |
| donor_acceptances | donor_id | donors.id | SET NULL | CASCADE |

---

## 📈 Indexes

### users
- PRIMARY KEY: id
- UNIQUE KEY: email

### donors
- PRIMARY KEY: id
- UNIQUE KEY: user_id

### hospitals
- PRIMARY KEY: id
- UNIQUE KEY: user_id

### blood_requests
- PRIMARY KEY: id
- KEY: hospital_id
- KEY: status

### donor_responses
- PRIMARY KEY: id
- UNIQUE KEY: (request_id, donor_id)
- KEY: donor_id

### notifications
- PRIMARY KEY: id
- KEY: user_id

### donor_acceptances
- PRIMARY KEY: id
- KEY: request_id
- KEY: donor_id
- KEY: status

---

## 🔐 Data Types Used

| Type | Usage | Examples |
|------|-------|----------|
| INT UNSIGNED | IDs, counts | id, age, quantity_units |
| VARCHAR | Text fields | name, email, city, blood_type |
| ENUM | Fixed options | role, blood_type, urgency, status |
| DECIMAL | Precise numbers | location_lat, location_lng, weight |
| TEXT | Long text | notes, medical_conditions, message |
| DATE | Dates | last_donation_date, appointment_date |
| TIME | Times | appointment_time |
| TIMESTAMP | Timestamps | created_at, updated_at, responded_at |
| TINYINT(1) | Boolean | is_available, is_verified, is_approved |
| BOOLEAN | Boolean | is_read |

---

## 📝 SQL Scripts

### Create Database
```sql
CREATE DATABASE IF NOT EXISTS bloodconnect
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### Run All Scripts
```bash
# Local MySQL
mysql -u root < database.sql
mysql -u root bloodconnect < migration.sql
mysql -u root bloodconnect < database_add_health_fields.sql

# TiDB Cloud
mysql -h gateway01.us-east-1.prod.aws.tidbcloud.com \
      -P 4000 \
      -u EKBMzWXHKo28J9b.root \
      -p < database.sql
```

---

## 🎯 Summary

**Database Name:** `bloodconnect` (or `sys` on TiDB Cloud)

**Total Tables:** 7
- users
- donors
- hospitals
- blood_requests
- donor_responses
- notifications
- donor_acceptances

**Total Columns:** 80+

**Total Relationships:** 8 foreign keys

**Character Set:** utf8mb4 (Unicode)

**Engine:** InnoDB (with transactions and foreign keys)

---

**Last Updated:** 2024  
**Version:** 1.0.0  
**Status:** Production Ready ✅
