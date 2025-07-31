# Auto Message Scheduler

## Overview
Auto Message Scheduler adalah sistem untuk mengirim pesan terjadwal secara otomatis di background, bahkan ketika website ditutup.

## API Endpoints

### 1. Auto Message Scheduler
- **Endpoint:** `/api/auto-message-scheduler`
- **Method:** POST
- **Fungsi:** Mengirim pesan terjadwal yang sudah waktunya dikirim

### 2. Cron Job
- **Endpoint:** `/api/cron-auto-message`
- **Method:** POST
- **Fungsi:** Endpoint untuk cron job yang memanggil auto message scheduler

## Cara Setup Cron Job

### 1. Menggunakan cPanel Cron Jobs
```bash
# Jalankan setiap 1 menit
* * * * * curl -X POST https://your-domain.com/api/cron-auto-message

# Jalankan setiap 5 menit
*/5 * * * * curl -X POST https://your-domain.com/api/cron-auto-message

# Jalankan setiap 10 menit
*/10 * * * * curl -X POST https://your-domain.com/api/cron-auto-message
```

### 2. Menggunakan Linux Cron
```bash
# Edit crontab
crontab -e

# Tambahkan baris berikut untuk menjalankan setiap 5 menit
*/5 * * * * curl -X POST https://your-domain.com/api/cron-auto-message
```

### 3. Menggunakan Windows Task Scheduler
1. Buka Task Scheduler
2. Create Basic Task
3. Set trigger untuk setiap 5 menit
4. Set action untuk menjalankan curl command

### 4. Menggunakan Cloudflare Workers (Alternatif)
```javascript
// cloudflare-worker.js
addEventListener('scheduled', event => {
  event.waitUntil(handleScheduled());
});

async function handleScheduled() {
  const response = await fetch('https://your-domain.com/api/cron-auto-message', {
    method: 'POST',
  });
  return response;
}
```

## Fitur Auto Message Scheduler

### 1. Background Processing
- Berjalan di background tanpa perlu website terbuka
- Menggunakan cron job untuk trigger otomatis

### 2. Delay Antar Pesan
- Delay 60 detik antar pengiriman pesan
- Mencegah spam dan rate limiting

### 3. Error Handling
- Logging detail untuk monitoring
- Update status pesan (sent/failed)
- Continue processing meskipun ada error

### 4. Metadata Support
- Menambahkan metadata untuk identifikasi auto message
- Mencegah duplikasi di webhook

### 5. Contact Validation
- Validasi format nomor telepon
- Filter kontak yang valid
- Handle berbagai format contact_ids

## Monitoring

### 1. Log Monitoring
```bash
# Cek log server
tail -f /var/log/nginx/error.log

# Cek log aplikasi
pm2 logs
```

### 2. Database Monitoring
```sql
-- Cek status auto messages
SELECT id, title, status, scheduled_at, sent_at 
FROM auto_messages 
ORDER BY created_at DESC;

-- Cek auto messages yang gagal
SELECT * FROM auto_messages 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

### 3. API Testing
```bash
# Test scheduler manual
curl -X POST https://your-domain.com/api/auto-message-scheduler

# Test cron job
curl -X POST https://your-domain.com/api/cron-auto-message
```

## Troubleshooting

### 1. Cron Job Tidak Berjalan
- Cek apakah cron service aktif: `systemctl status cron`
- Cek log cron: `tail -f /var/log/cron`
- Test command manual: `curl -X POST https://your-domain.com/api/cron-auto-message`

### 2. Pesan Tidak Terkirim
- Cek status channel (aktif/tidak)
- Cek session_name channel
- Cek format nomor telepon kontak
- Cek WAHA configuration

### 3. Error Rate Limiting
- Pastikan delay 60 detik berjalan
- Cek log untuk error dari WAHA
- Monitor penggunaan API key

## Security Considerations

### 1. API Protection
- Endpoint hanya bisa diakses dari cron job
- Tidak ada endpoint public untuk trigger manual
- Logging untuk audit trail

### 2. Data Protection
- Menggunakan service role key untuk database access
- Tidak menyimpan sensitive data di log
- Validasi input sebelum processing

## Performance Optimization

### 1. Database Indexing
```sql
-- Index untuk query scheduler
CREATE INDEX idx_auto_messages_status_scheduled_at 
ON auto_messages(status, scheduled_at);

-- Index untuk contact lookup
CREATE INDEX idx_contacts_phone_number 
ON contacts(phone_number);
```

### 2. Batch Processing
- Process multiple messages dalam satu cron run
- Optimize database queries
- Efficient error handling

## Configuration

### 1. Environment Variables
```bash
# WAHA Configuration
WAHA_BASE_URL=https://your-waha-server.com
WAHA_API_KEY=your-api-key

# Database Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Cron Schedule
- **Development:** Setiap 1 menit untuk testing
- **Production:** Setiap 5-10 menit untuk efisiensi
- **High Volume:** Setiap 1 menit dengan monitoring

## Best Practices

### 1. Monitoring
- Setup alert untuk cron job failure
- Monitor database performance
- Track message delivery rate

### 2. Backup
- Backup database secara regular
- Backup cron configuration
- Document setup process

### 3. Testing
- Test dengan dummy data
- Test error scenarios
- Test dengan berbagai format data 