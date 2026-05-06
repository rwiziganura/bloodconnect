-- Add health information fields to donor_responses table
USE bloodconnect;

ALTER TABLE donor_responses
ADD COLUMN donor_weight DECIMAL(5,2) NULL 
AFTER status;

ALTER TABLE donor_responses
ADD COLUMN donor_age INT NULL 
AFTER donor_weight;

ALTER TABLE donor_responses
ADD COLUMN donor_email VARCHAR(100) NULL 
AFTER donor_age;

ALTER TABLE donor_responses
ADD COLUMN donor_phone VARCHAR(20) NULL 
AFTER donor_email;

ALTER TABLE donor_responses
ADD COLUMN medical_conditions TEXT NULL 
AFTER donor_phone;

ALTER TABLE donor_responses
ADD COLUMN submitted_at TIMESTAMP 
DEFAULT CURRENT_TIMESTAMP 
AFTER medical_conditions;
