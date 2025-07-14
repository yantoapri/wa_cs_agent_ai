-- Migration: Tambah/ubah field pada tabel agents untuk mendukung data agent manusia lengkap
-- Jalankan di Supabase

alter table agents
  add column if not exists agent_code text unique,
  add column if not exists full_name text,
  add column if not exists alias text,
  add column if not exists avatar_url text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists start_date date,
  add column if not exists employment_status text,
  add column if not exists availability_status text,
  add column if not exists shift_schedule jsonb,
  add column if not exists concurrent_capacity integer,
  add column if not exists last_online_at timestamptz,
  add column if not exists languages text[],
  add column if not exists product_expertise text[],
  add column if not exists topic_expertise text[],
  add column if not exists skill_level text,
  add column if not exists department text,
  add column if not exists total_chats integer,
  add column if not exists avg_response_time integer,
  add column if not exists avg_resolution_time integer,
  add column if not exists rating numeric,
  add column if not exists fcr numeric,
  add column if not exists performance_notes text; 