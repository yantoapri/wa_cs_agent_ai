-- Migration: Tambah kolom session_name ke tabel chanels
-- Jalankan di Supabase

ALTER TABLE chanels ADD COLUMN IF NOT EXISTS session_name VARCHAR(255);

-- Update session_name untuk chanels yang sudah ada berdasarkan whatsapp_sessions
UPDATE chanels 
SET session_name = ws.session_name
FROM whatsapp_sessions ws 
WHERE chanels.id = ws.chanel_id 
AND chanels.session_name IS NULL;

-- Set default session_name untuk chanels yang belum punya
UPDATE chanels 
SET session_name = 'default' 
WHERE session_name IS NULL; 