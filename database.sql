-- BloodConnect — create database and schema for MySQL (XAMPP)
-- Run this in phpMyAdmin or: mysql -u root < database.sql

CREATE DATABASE IF NOT EXISTS bloodconnect
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bloodconnect;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
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

-- ---------------------------------------------------------------------------
-- donors
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS donors (
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

-- ---------------------------------------------------------------------------
-- hospitals
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hospitals (
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

-- ---------------------------------------------------------------------------
-- blood_requests
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blood_requests (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  hospital_id INT UNSIGNED NOT NULL,
  blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
  quantity_units INT UNSIGNED NOT NULL DEFAULT 1,
  urgency ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  status ENUM('open', 'fulfilled', 'cancelled') NOT NULL DEFAULT 'open',
  notes TEXT DEFAULT NULL,
  donors_notified_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_blood_requests_hospital (hospital_id),
  KEY idx_blood_requests_status (status),
  CONSTRAINT fk_blood_requests_hospital
    FOREIGN KEY (hospital_id) REFERENCES hospitals (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- donor_responses
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS donor_responses (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  request_id INT UNSIGNED NOT NULL,
  donor_id INT UNSIGNED NOT NULL,
  status ENUM('pending', 'accepted', 'declined', 'completed') NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMP NULL DEFAULT NULL,
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

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(64) NOT NULL DEFAULT 'info',
  status ENUM('unread', 'read') NOT NULL DEFAULT 'unread',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user (user_id),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
