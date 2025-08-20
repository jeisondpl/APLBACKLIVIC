-- Migration: Add tarifa fields to booking_apartments table
-- Date: 2025-08-19
-- Description: Add tarifa_por_noche, tarifa_limpieza, and tarifa_aseo columns

-- Add the new columns if they don't exist
DO $$ 
BEGIN
    -- Add tarifa_por_noche column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'booking_apartments' AND column_name = 'tarifa_por_noche') THEN
        ALTER TABLE booking_apartments ADD COLUMN tarifa_por_noche DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    -- Add tarifa_limpieza column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'booking_apartments' AND column_name = 'tarifa_limpieza') THEN
        ALTER TABLE booking_apartments ADD COLUMN tarifa_limpieza DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    -- Add tarifa_aseo column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'booking_apartments' AND column_name = 'tarifa_aseo') THEN
        ALTER TABLE booking_apartments ADD COLUMN tarifa_aseo DECIMAL(10,2) DEFAULT 0.00;
    END IF;
END $$;

-- Update existing records with sample tarifa values
UPDATE booking_apartments SET 
    tarifa_por_noche = CASE 
        WHEN apartamento_id = 1 THEN 150000.00
        WHEN apartamento_id = 2 THEN 120000.00  
        WHEN apartamento_id = 3 THEN 300000.00
        ELSE 100000.00
    END,
    tarifa_limpieza = CASE 
        WHEN apartamento_id = 1 THEN 50000.00
        WHEN apartamento_id = 2 THEN 40000.00
        WHEN apartamento_id = 3 THEN 80000.00  
        ELSE 30000.00
    END,
    tarifa_aseo = CASE 
        WHEN apartamento_id = 1 THEN 25000.00
        WHEN apartamento_id = 2 THEN 20000.00
        WHEN apartamento_id = 3 THEN 40000.00
        ELSE 15000.00
    END
WHERE tarifa_por_noche = 0 OR tarifa_limpieza = 0 OR tarifa_aseo = 0;