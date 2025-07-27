-- Migration: Update sample chanel data with realistic values
-- Jalankan di Supabase

-- Update existing sample chanels with realistic takeover and limit settings
UPDATE chanels 
SET 
  takeover_ai = true,
  waktu_takeover = 5,
  limit_balasan_ai = true,
  maksimum_balasan_ai = 3
WHERE name IN ('WhatsApp chanel 1', 'WhatsApp chanel 2');

-- Set session_name for existing chanels if not set
UPDATE chanels 
SET session_name = 'default' 
WHERE session_name IS NULL; 