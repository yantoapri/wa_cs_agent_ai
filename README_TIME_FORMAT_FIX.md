# Time Format Fix Documentation

## Masalah

Input waktu di `ChatForm.vue` menggunakan format 24 jam, tetapi ada kemungkinan data yang tersimpan masih dalam format 12 jam (AM/PM). Ketika cron job berjalan, sistem tidak bisa membedakan apakah jam 8 adalah pagi atau malam.

## Solusi yang Diterapkan

### 1. Auto Message Scheduler Enhancement

- ✅ Menambahkan fungsi `formatTimeTo24Hour()` di scheduler
- ✅ Menambahkan fungsi `getDueSchedules()` untuk memproses schedules
- ✅ Menambahkan logging untuk debugging waktu
- ✅ Support untuk multiple schedules per message

### 2. ChatForm.vue Enhancement

- ✅ Memastikan semua waktu disimpan dalam format 24 jam
- ✅ Menambahkan validasi format waktu sebelum disimpan
- ✅ Menambahkan logging untuk debugging
- ✅ Support untuk custom dan interval schedules

### 3. Database Migration

- ✅ Migration `021_fix_time_format_in_schedules.sql` untuk data existing
- ✅ Conditional execution untuk mencegah error

## Fungsi formatTimeTo24Hour

```javascript
const formatTimeTo24Hour = (timeString) => {
  if (!timeString) return "00:00";

  // If already in 24-hour format, return as is
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return timeString;
  }

  // Convert from 12-hour to 24-hour format
  const [time, period] = timeString.split(" ");
  const [hours, minutes] = time.split(":").map(Number);

  let hour24 = hours;
  if (period === "PM" && hours !== 12) {
    hour24 = hours + 12;
  } else if (period === "AM" && hours === 12) {
    hour24 = 0;
  }

  return `${hour24.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};
```

## Contoh Konversi

| Input      | Output  | Keterangan   |
| ---------- | ------- | ------------ |
| "08:00"    | "08:00" | Sudah 24 jam |
| "8:00 AM"  | "08:00" | Pagi         |
| "8:00 PM"  | "20:00" | Malam        |
| "12:00 AM" | "00:00" | Tengah malam |
| "12:00 PM" | "12:00" | Siang        |

## Auto Message Scheduler Changes

### 1. Enhanced Query

```sql
SELECT
  id, title, message, contact_ids, contact_count,
  scheduled_at, schedules, interval_config, status,
  created_by, chanel_id
FROM auto_messages
WHERE status = 'scheduled'
ORDER BY scheduled_at ASC
```

### 2. Schedule Processing

```javascript
const getDueSchedules = (message) => {
  const schedules = [];

  // Process schedules array
  if (message.schedules && Array.isArray(message.schedules)) {
    for (const schedule of message.schedules) {
      if (schedule.date && schedule.time) {
        const scheduleTime = formatTimeTo24Hour(schedule.time);
        const scheduleDateTime = new Date(`${schedule.date}T${scheduleTime}`);

        // Check if due (within last 5 minutes)
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        if (scheduleDateTime >= fiveMinutesAgo && scheduleDateTime <= now) {
          schedules.push({
            date: schedule.date,
            time: scheduleTime,
            originalTime: schedule.time,
          });
        }
      }
    }
  }

  return schedules;
};
```

## ChatForm.vue Changes

### 1. Time Format Validation

```javascript
// Ensure all times are in 24-hour format before saving
formData.schedules = form.value.schedules.map((schedule) => ({
  ...schedule,
  time: formatTimeTo24Hour(schedule.time),
}));
```

### 2. Interval Config

```javascript
formData.interval_config = {
  startDate: intervalSchedule.value.startDate,
  time: formatTimeTo24Hour(intervalSchedule.value.time),
  weekDays: intervalSchedule.value.weekDays,
  endDate: intervalSchedule.value.endDate,
};
```

### 3. Scheduled_at Generation

```javascript
const formattedTime = formatTimeTo24Hour(firstSchedule.time);
formData.scheduled_at = new Date(
  `${firstSchedule.date}T${formattedTime}`
).toISOString();
```

## Logging untuk Debugging

### Auto Message Scheduler

```
[Auto Message Scheduler] Schedule 1: 2024-01-15 08:00 (original: 8:00 AM)
[Auto Message Scheduler] Schedule 2: 2024-01-15 20:00 (original: 8:00 PM)
```

### ChatForm

```
[ChatForm] Schedule time formatted: 8:00 AM -> 08:00
[ChatForm] Scheduled at: 2024-01-15T08:00:00.000Z
```

## Testing

### 1. Test Time Format Conversion

```javascript
// Test cases
console.log(formatTimeTo24Hour("08:00")); // "08:00"
console.log(formatTimeTo24Hour("8:00 AM")); // "08:00"
console.log(formatTimeTo24Hour("8:00 PM")); // "20:00"
console.log(formatTimeTo24Hour("12:00 AM")); // "00:00"
console.log(formatTimeTo24Hour("12:00 PM")); // "12:00"
```

### 2. Test Schedule Processing

```javascript
// Test with sample data
const message = {
  schedules: [
    { date: "2024-01-15", time: "8:00 AM" },
    { date: "2024-01-15", time: "8:00 PM" },
  ],
};

const dueSchedules = getDueSchedules(message);
console.log(dueSchedules);
```

## Migration Order

1. `021_fix_time_format_in_schedules.sql` - Fix existing data
   - ✅ Uses `$func$` delimiter untuk menghindari konflik dengan `DO $$`
   - ✅ Conditional execution untuk mencegah error
   - ✅ Creates helper function untuk format waktu
2. Deploy updated `auto-message-scheduler.post.js`
3. Deploy updated `ChatForm.vue`

## Monitoring

### 1. Check Scheduler Logs

```bash
# Monitor scheduler execution
tail -f /var/log/auto-message-scheduler.log
```

### 2. Check Database

```sql
-- Check schedules format
SELECT id, title, schedules, scheduled_at
FROM auto_messages
WHERE status = 'scheduled'
ORDER BY created_at DESC;
```

### 3. Check Time Format

```sql
-- Verify time format in schedules
SELECT
  id,
  title,
  schedules,
  CASE
    WHEN schedules::text ~ '"time": "[0-9]{2}:[0-9]{2}"'
    THEN '24-hour format'
    ELSE '12-hour format'
  END as time_format
FROM auto_messages
WHERE schedules IS NOT NULL;
```

## Troubleshooting

### 1. Migration Syntax Error

- **Error**: `syntax error at or near "BEGIN"`
- **Cause**: Nested `$$` delimiters dalam PostgreSQL
- **Solution**: Gunakan `$func$` untuk fungsi dalam blok `DO $$`

### 2. Time Not Converting

- Check browser console for formatTimeTo24Hour errors
- Verify input time format in form
- Check database for existing data format

### 3. Scheduler Not Running

- Check cron job configuration
- Verify scheduler logs
- Check database connection

### 4. Wrong Time Being Sent

- Check timezone settings
- Verify scheduled_at format
- Check schedules array format

## Best Practices

### 1. Always Use 24-Hour Format

- Input time should always be in 24-hour format
- Store time in 24-hour format in database
- Display time in 24-hour format in UI

### 2. Validate Time Format

- Check time format before saving
- Convert 12-hour to 24-hour if needed
- Log time conversions for debugging

### 3. Test Thoroughly

- Test with various time formats
- Test with different timezones
- Test with existing data
