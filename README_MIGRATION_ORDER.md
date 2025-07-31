# Migration Order Guide

## Urutan Migration yang Benar

### 1. Initial Schema (001)
- ✅ Membuat tabel dasar: `users`, `chanels`, `agents`, `contacts`, `conversations`, `messages`
- ✅ Membuat index: `idx_contacts_phone` untuk `contacts(phone_number)`
- ✅ Membuat trigger dan RLS policies

### 2. WhatsApp Integration (002)
- ✅ Menambahkan tabel `whatsapp_sessions`
- ✅ Menambahkan kolom `whatsapp_number` ke `chanels`

### 3. Views and Functions (003)
- ✅ Membuat views dan functions untuk WhatsApp integration

### 4. Agent Fields (004-006)
- ✅ Menambahkan `no_hp` ke `agents`
- ✅ Menambahkan fields untuk `agent_manusia`
- ✅ Menambahkan `created_by` ke `chanels` dan `agents`

### 5. Foreign Keys (008)
- ✅ Menambahkan foreign key constraints

### 6. Session Name (009-011)
- ✅ Menambahkan `session_name` ke `chanels`
- ✅ Update data existing

### 7. Broadcast and Auto Messages (012)
- ✅ Membuat tabel `broadcast_messages` dan `auto_messages`
- ✅ Membuat index untuk scheduler: `idx_auto_messages_scheduled_at_status`

### 8. Products (013-016)
- ✅ Membuat tabel `products` dan related fields

### 9. Auto Message Indexes (018)
- ✅ Menambahkan index untuk optimasi scheduler
- ✅ Menambahkan index untuk `chanels(session_name)`
- ⚠️ **Note**: `idx_contacts_phone` sudah ada di migration 001

### 10. Interval Config (019)
- ✅ Menambahkan kolom `interval_config` ke `auto_messages`
- ✅ Membuat index untuk `interval_config`

### 11. Chanel ID and Schedules (020)
- ✅ Menambahkan kolom `chanel_id` ke `auto_messages`
- ✅ Menambahkan kolom `schedules` ke `auto_messages`
- ✅ Membuat index untuk `schedules`

## Index yang Sudah Ada

### Contacts Table
- `idx_contacts_phone` (migration 001) - untuk `contacts(phone_number)`

### Chanels Table
- `idx_chanels_session_name` (migration 018) - untuk `chanels(session_name)`

### Auto Messages Table
- `idx_auto_messages_scheduled_at_status` (migration 012)
- `idx_auto_messages_status_scheduled_at` (migration 018)
- `idx_auto_messages_created_by_status` (migration 018)
- `idx_auto_messages_chanel_id_status` (migration 018)
- `idx_auto_messages_scheduler_query` (migration 018)
- `idx_auto_messages_interval_config` (migration 019)
- `idx_auto_messages_schedules` (migration 020)

## Troubleshooting

### Error: "relation does not exist"
- Pastikan migration dijalankan sesuai urutan
- Migration 018, 019, 020 menggunakan conditional execution untuk mencegah error

### Error: "duplicate index"
- Index `idx_contacts_phone` sudah ada di migration 001
- Migration 018 tidak membuat index duplikat untuk contacts

### Error: "column does not exist"
- Kolom `session_name` ditambahkan di migration 009
- Kolom `chanel_id` ditambahkan di migration 020
- Kolom `schedules` ditambahkan di migration 020
- Kolom `interval_config` ditambahkan di migration 019

## Best Practices

### 1. Conditional Execution
```sql
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'table_name') THEN
        -- Create index or alter table
    END IF;
END $$;
```

### 2. Check Column Existence
```sql
IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'table_name' AND column_name = 'column_name'
) THEN
    ALTER TABLE table_name ADD COLUMN column_name TYPE;
END IF;
```

### 3. Check Index Existence
```sql
IF NOT EXISTS (
    SELECT FROM pg_indexes 
    WHERE tablename = 'table_name' AND indexname = 'index_name'
) THEN
    CREATE INDEX index_name ON table_name(column_name);
END IF;
```

## Running Migrations

### Development
```bash
# Reset database
supabase db reset

# Apply all migrations
supabase db push
```

### Production
```bash
# Apply migrations safely
supabase db push --dry-run
supabase db push
```

## Verification

### Check Tables
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Check Indexes
```sql
SELECT tablename, indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

### Check Columns
```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('auto_messages', 'contacts', 'chanels')
ORDER BY table_name, ordinal_position;
``` 