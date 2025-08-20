-- Migration: Remove tarifa_aseo column from booking_apartments table
-- Date: 2025-08-19
-- Description: Remove tarifa_aseo column, keep only tarifaLimpieza

-- Remove the tarifa_aseo column
ALTER TABLE booking_apartments DROP COLUMN IF EXISTS tarifa_aseo;