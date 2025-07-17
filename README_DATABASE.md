# Database Schema - OsmoChat

Database schema untuk aplikasi OsmoChat yang menggunakan Supabase sebagai backend.

## Overview

Aplikasi OsmoChat adalah platform chat WhatsApp dengan integrasi AI yang memungkinkan:

- Manajemen chanel WhatsApp
- Agent AI dan manusia
- Auto-reply dan template pesan
- Analisis performa dan metrik
- Integrasi dengan OpenAI

## Struktur Database

### Tabel Utama

#### 1. `users`

- Menyimpan data pengguna sistem
- Digunakan untuk autentikasi dan manajemen user

#### 2. `chanels`

- Menyimpan data chanel komunikasi (WhatsApp, Messenger, dll)
- Konfigurasi takeover AI dan limit balasan

#### 3. `agents`

- Menyimpan data agent AI dan manusia
- Status agent (online/offline/busy/away)

#### 4. `agent_ai_configs`

- Konfigurasi khusus untuk agent AI
- Gaya bicara, pengetahuan, kondisi handover

#### 5. `contacts`

- Data kontak pelanggan
- Terhubung dengan chanel tertentu

#### 6. `conversations`

- Data percakapan dengan pelanggan
- Tracking unread messages dan agent assignment

#### 7. `messages`

- Pesan dalam percakapan
- Support berbagai tipe pesan (text, image, document, dll)

### Tabel Integrasi WhatsApp

#### 8. `whatsapp_sessions`

- Status koneksi WhatsApp per chanel
- QR code dan autentikasi

#### 9. `whatsapp_message_templates`

- Template pesan dengan variabel
- Untuk auto-reply dan broadcast

#### 10. `auto_reply_rules`

- Aturan auto-reply berdasarkan keyword
- Prioritas dan delay response

### Tabel Analitik

#### 11. `conversation_metrics`

- Metrik performa percakapan
- Response time, satisfaction rating

#### 12. `ai_conversation_logs`

- Log percakapan AI
- Confidence score dan handover tracking

#### 13. `conversation_handovers`

- Tracking handover antar agent
- Alasan dan waktu handover

## Migrations

### 001_initial_schema.sql

- Membuat struktur database dasar
- Tabel utama dan relasi
- Sample data untuk testing

### 002_add_whatsapp_integration.sql

- Tabel integrasi WhatsApp
- Auto-reply rules dan templates
- Metrik dan logging

### 003_add_views_and_functions.sql

- Views untuk reporting
- Functions untuk operasi umum
- Triggers untuk automation

## Views

### 1. `conversation_summary`

View untuk menampilkan ringkasan percakapan dengan informasi agent dan chanel.

### 2. `agent_performance`

View untuk analisis performa agent (response time, satisfaction, handover).

### 3. `chanel_statistics`

View untuk statistik chanel (total conversations, unread, connected agents).

### 4. `ai_conversation_analysis`

View untuk analisis percakapan AI dengan confidence level.

## Functions

### 1. `get_conversation_with_messages(conv_id)`

Mengambil percakapan beserta semua pesannya.

### 2. `get_agent_ai_config(agent_uuid)`

Mengambil konfigurasi AI untuk agent tertentu.

### 3. `mark_conversation_as_read(conv_id)`

Menandai percakapan sebagai sudah dibaca.

### 4. `get_auto_reply_rules(chanel_uuid)`

Mengambil aturan auto-reply untuk chanel tertentu.

### 5. `log_ai_conversation(...)`

Mencatat log percakapan AI dengan berbagai parameter.

## Cara Menggunakan

### 1. Setup Supabase

```bash
# Install Supabase CLI
npm install -g supabase

# Login ke Supabase
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_ID
```

### 2. Jalankan Migrations

```bash
# Jalankan semua migrations
supabase db push

# Atau jalankan satu per satu
supabase db push --include-all
```

### 3. Reset Database (Development)

```bash
# Reset database dan jalankan ulang migrations
supabase db reset
```

### 4. Generate Types (TypeScript)

```bash
# Generate types dari schema
supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
```

## Contoh Query

### 1. Ambil semua percakapan dengan unread messages

```sql
SELECT * FROM conversation_summary
WHERE unread_count > 0
ORDER BY last_message_time DESC;
```

### 2. Ambil performa agent AI

```sql
SELECT * FROM agent_performance
WHERE agent_type = 'ai'
ORDER BY avg_satisfaction DESC;
```

### 3. Ambil statistik chanel

```sql
SELECT * FROM chanel_statistics
WHERE chanel_type = 'whatsapp';
```

### 4. Analisis percakapan AI

```sql
SELECT * FROM ai_conversation_analysis
WHERE confidence_level = 'Low'
ORDER BY created_at DESC;
```

## Integrasi dengan Frontend

### 1. Setup Supabase Client

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("YOUR_SUPABASE_URL", "YOUR_SUPABASE_ANON_KEY");
```

### 2. Contoh CRUD Operations

#### Ambil chanels

```typescript
const { data: chanels, error } = await supabase
  .from("chanels")
  .select("*")
  .eq("is_active", true);
```

#### Ambil Conversations dengan Agent

```typescript
const { data: conversations, error } = await supabase
  .from("conversation_summary")
  .select("*")
  .eq("assigned_agent_id", agentId);
```

#### Insert Message

```typescript
const { data, error } = await supabase.from("messages").insert({
  conversation_id: convId,
  content: messageText,
  direction: "outbound",
  message_type: "text",
  sender_name: "Agent Name",
});
```

#### Update Agent Status

```typescript
const { data, error } = await supabase
  .from("agents")
  .update({ status: "online" })
  .eq("id", agentId);
```

## Security

### Row Level Security (RLS)

Semua tabel memiliki RLS enabled dengan policy dasar yang mengizinkan semua operasi. Untuk production, sesuaikan policy sesuai kebutuhan:

```sql
-- Contoh policy yang lebih aman
CREATE POLICY "Users can only access their own data" ON users
FOR ALL USING (auth.uid() = id);
```

### Environment Variables

Pastikan environment variables berikut sudah diset:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Monitoring dan Maintenance

### 1. Backup Database

```bash
# Backup schema dan data
supabase db dump --data-only > backup_$(date +%Y%m%d).sql
```

### 2. Monitor Performance

- Gunakan views `agent_performance` dan `chanel_statistics`
- Monitor query performance dengan Supabase dashboard
- Set up alerts untuk error rates

### 3. Cleanup Old Data

```sql
-- Hapus log AI yang lebih dari 30 hari
DELETE FROM ai_conversation_logs
WHERE created_at < NOW() - INTERVAL '30 days';

-- Archive old conversations
UPDATE conversations
SET is_active = false
WHERE updated_at < NOW() - INTERVAL '90 days';
```

## Troubleshooting

### 1. Migration Error

```bash
# Reset dan jalankan ulang
supabase db reset
supabase db push
```

### 2. RLS Policy Issues

```sql
-- Disable RLS sementara untuk debugging
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

### 3. Performance Issues

- Tambahkan index untuk query yang sering digunakan
- Monitor slow queries di Supabase dashboard
- Optimize views dan functions

## Support

Untuk pertanyaan atau masalah terkait database schema, silakan buat issue di repository atau hubungi tim development.
