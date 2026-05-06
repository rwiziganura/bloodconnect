USE bloodconnect;
ALTER TABLE hospitals
  ADD COLUMN address VARCHAR(255) DEFAULT NULL AFTER city;
