-- ============================================================
-- BloodConnect — migration to add all columns added since
-- the original database.sql was created.
-- Run this ONCE in phpMyAdmin on the bloodconnect database.
-- Each statement uses IF NOT EXISTS so it is safe to re-run.
-- ============================================================

USE bloodconnect;

-- -------------------------------------------------------
-- hospitals: add missing columns
-- -------------------------------------------------------
ALTER TABLE hospitals
  ADD COLUMN IF NOT EXISTS address VARCHAR(255) DEFAULT NULL
    AFTER city;

ALTER TABLE hospitals
  ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10,7) DEFAULT NULL
    AFTER address;

ALTER TABLE hospitals
  ADD COLUMN IF NOT EXISTS location_lng DECIMAL(10,7) DEFAULT NULL
    AFTER location_lat;

-- -------------------------------------------------------
-- blood_requests: make hospital_id nullable
-- -------------------------------------------------------
ALTER TABLE blood_requests
  MODIFY COLUMN hospital_id INT UNSIGNED NULL DEFAULT NULL;

-- -------------------------------------------------------
-- blood_requests: add columns for personal / donor requests
-- -------------------------------------------------------
ALTER TABLE blood_requests
  ADD COLUMN IF NOT EXISTS request_type
    ENUM('hospital','personal') NOT NULL DEFAULT 'hospital'
    AFTER hospital_id;

ALTER TABLE blood_requests
  ADD COLUMN IF NOT EXISTS requester_id INT UNSIGNED NULL
    AFTER request_type;

ALTER TABLE blood_requests
  ADD COLUMN IF NOT EXISTS patient_name VARCHAR(100) NULL
    AFTER requester_id;

ALTER TABLE blood_requests
  ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20) NULL
    AFTER patient_name;

ALTER TABLE notifications
  MODIFY COLUMN type ENUM('sms','email','both','info','blood_request') NOT NULL DEFAULT 'both';

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE
    AFTER status;

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS request_id INT UNSIGNED NULL
    AFTER is_read;

-- -------------------------------------------------------
-- donor_responses: add extra columns used by the app
-- -------------------------------------------------------
ALTER TABLE donor_responses
  ADD COLUMN IF NOT EXISTS donor_weight DECIMAL(5,2) NULL AFTER responded_at;

ALTER TABLE donor_responses
  ADD COLUMN IF NOT EXISTS donor_age INT NULL AFTER donor_weight;

ALTER TABLE donor_responses
  ADD COLUMN IF NOT EXISTS donor_email VARCHAR(255) NULL AFTER donor_age;

ALTER TABLE donor_responses
  ADD COLUMN IF NOT EXISTS donor_phone VARCHAR(32) NULL AFTER donor_email;

ALTER TABLE donor_responses
  ADD COLUMN IF NOT EXISTS medical_conditions TEXT NULL AFTER donor_phone;
