-- Run once if your database was created before donors_notified_count existed:
USE bloodconnect;
ALTER TABLE blood_requests
  ADD COLUMN donors_notified_count INT UNSIGNED NOT NULL DEFAULT 0
  AFTER notes;
