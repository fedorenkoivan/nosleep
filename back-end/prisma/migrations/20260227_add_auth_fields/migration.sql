-- AlterTable user - add authentication fields
ALTER TABLE "user" 
  ADD COLUMN "password_hash" VARCHAR(255),
  ADD COLUMN "password_salt" VARCHAR(255),
  ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update name and email column sizes
ALTER TABLE "user" 
  ALTER COLUMN "name" TYPE VARCHAR(100),
  ALTER COLUMN "email" TYPE VARCHAR(100);

-- Add unique constraint on email
ALTER TABLE "user" 
  ADD CONSTRAINT "user_email_key" UNIQUE ("email");

-- Migrate existing password data (if needed)
-- Update password_hash with existing password values temporarily
UPDATE "user" 
SET password_hash = password, 
    password_salt = 'legacy'
WHERE password_hash IS NULL;

-- Make password_hash and password_salt NOT NULL
ALTER TABLE "user" 
  ALTER COLUMN "password_hash" SET NOT NULL,
  ALTER COLUMN "password_salt" SET NOT NULL;

-- Drop old password column (after data migration)
ALTER TABLE "user" DROP COLUMN "password";
