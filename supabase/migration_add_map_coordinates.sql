-- Migration: Tambahkan kolom koordinat latitude & longitude pada tabel orders
-- Aman dijalankan berulang kali (Idempotent)

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Tambahkan juga pada profiles untuk default koordinat customer (opsional)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_orders_coordinates ON orders (latitude, longitude);
