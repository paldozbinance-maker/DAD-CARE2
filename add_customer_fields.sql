-- Add gender and phone columns to existing Customer table
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "gender" text;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "phone" text;
