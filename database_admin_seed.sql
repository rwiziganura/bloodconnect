-- Optional: create an admin user (run after database.sql).
-- Login: admin@bloodconnect.local  /  password
-- Change the password in production.

USE bloodconnect;

INSERT INTO users (name, email, phone, password, role, is_verified)
SELECT * FROM (
  SELECT
    'System Admin' AS name,
    'admin@bloodconnect.local' AS email,
    NULL AS phone,
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' AS password,
    'admin' AS role,
    1 AS is_verified
) AS t
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@bloodconnect.local'
);
