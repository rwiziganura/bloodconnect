-- Add donor acceptance table for detailed donor information
USE bloodconnect;

CREATE TABLE IF NOT EXISTS donor_acceptances (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  request_id INT UNSIGNED NOT NULL,
  donor_id INT UNSIGNED NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  email VARCHAR(255) NOT NULL,
  age INT UNSIGNED NOT NULL,
  weight DECIMAL(5, 2) NOT NULL,
  blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
  last_donation_date DATE DEFAULT NULL,
  medical_conditions TEXT DEFAULT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
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
