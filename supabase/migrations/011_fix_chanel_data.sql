-- Migration: Fix existing chanel data
-- Jalankan di Supabase

-- Update semua chanel yang ada untuk memastikan nilai boolean yang benar
UPDATE chanels 
SET 
  takeover_ai = COALESCE(takeover_ai, false),
  limit_balasan_ai = COALESCE(limit_balasan_ai, false),
  waktu_takeover = COALESCE(waktu_takeover, 0),
  maksimum_balasan_ai = COALESCE(maksimum_balasan_ai, 0),
  session_name = COALESCE(session_name, 'default')
WHERE is_active = true;

-- Set beberapa chanel sample dengan nilai yang lebih realistis
UPDATE chanels 
SET 
  takeover_ai = true,
  waktu_takeover = 5,
  limit_balasan_ai = true,
  maksimum_balasan_ai = 3
WHERE name LIKE '%WhatsApp chanel%' AND is_active = true; 