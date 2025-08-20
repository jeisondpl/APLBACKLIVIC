-- Add authentication fields to users table
-- This migration adds password_hash and role columns to support authentication

-- Add password_hash column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Add role column with enum constraint
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager'));

-- Update existing users with default password and role
-- Default password will be 'password123' (hashed) for development
-- In production, users should be required to set their passwords on first login
UPDATE users 
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash of 'password123'
    role = 'user'
WHERE password_hash IS NULL;

-- Make password_hash NOT NULL after setting defaults
ALTER TABLE users 
ALTER COLUMN password_hash SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email_password ON users(email, password_hash);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO livic_user;