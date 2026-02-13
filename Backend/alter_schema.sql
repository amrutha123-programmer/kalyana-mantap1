-- Make user_id nullable in bookings table to allow guest bookings
ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL;
