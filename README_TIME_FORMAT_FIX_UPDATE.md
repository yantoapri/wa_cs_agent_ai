# Time Format Fix for Auto Message Schedules

## Masalah
Data `schedules` di tabel `auto_messages` tidak tersimpan dalam format 24 jam, menyebabkan masalah saat cron job berjalan karena tidak bisa membedakan antara AM/PM.

## Solusi yang Diterapkan

### 1. Perbaikan Fungsi `formatTimeTo24Hour`
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

  const result = `${hour24.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
    
  console.log(`[ChatForm] formatTimeTo24Hour: ${timeString} -> ${result}`);
  return result;
};
```

### 2. Perbaikan `convertIntervalToSchedules`
```javascript
const convertIntervalToSchedules = () => {
  // ...
  const time = formatTimeTo24Hour(intervalSchedule.value.time); // Ensure 24-hour format
  // ...
  schedules.push({
    date: currentDate.toISOString().split("T")[0],
    time: time, // This is now guaranteed to be in 24-hour format
  });
  // ...
};
```

### 3. Perbaikan `initializeForm`
```javascript
// For existing schedules
form.value.schedules = props.editData.schedules.map((schedule) => ({
  ...schedule,
  time: formatTimeTo24Hour(schedule.time), // Ensure 24-hour format
}));

// For scheduled_at conversion
form.value.schedules = [
  {
    date: scheduledDate.toISOString().split("T")[0],
    time: formatTimeTo24Hour(scheduledDate.toTimeString().slice(0, 5)), // Ensure 24-hour format
  },
];

// For interval config
intervalSchedule.value = {
  startDate: props.editData.interval_config.startDate || today.value,
  time: formatTimeTo24Hour(props.editData.interval_config.time || "00:00"),
  weekDays: props.editData.interval_config.weekDays || [],
  endDate: props.editData.interval_config.endDate || "",
};
```

### 4. Perbaikan `handleSubmit`
```javascript
// For custom schedules
formData.schedules = form.value.schedules.map((schedule) => {
  const formattedTime = formatTimeTo24Hour(schedule.time);
  console.log(`[ChatForm] Custom schedule time: ${schedule.time} -> ${formattedTime}`);
  return {
    ...schedule,
    time: formattedTime,
  };
});

// For interval schedules
formData.schedules = convertIntervalToSchedules(); // Already ensures 24-hour format
formData.interval_config = {
  startDate: intervalSchedule.value.startDate,
  time: formatTimeTo24Hour(intervalSchedule.value.time),
  weekDays: intervalSchedule.value.weekDays,
  endDate: intervalSchedule.value.endDate,
};
```

## Logging untuk Debugging

### 1. Time Format Conversion
```javascript
console.log(`[ChatForm] formatTimeTo24Hour: ${timeString} -> ${result}`);
```

### 2. Schedule Generation
```javascript
console.log(`[ChatForm] Custom schedule time: ${schedule.time} -> ${formattedTime}`);
console.log(`[ChatForm] Interval schedules generated:`, formData.schedules);
```

### 3. Final Data
```javascript
console.log(`[ChatForm] Final schedules to save:`, formData.schedules);
```

## Testing

### 1. Custom Schedules
- ✅ Input waktu dalam format 12 jam (2:00 PM) → tersimpan sebagai 14:00
- ✅ Input waktu dalam format 24 jam (14:00) → tersimpan sebagai 14:00
- ✅ Multiple schedules dengan format yang berbeda

### 2. Interval Schedules
- ✅ Interval time dalam format 12 jam → dikonversi ke 24 jam
- ✅ Generated schedules semua dalam format 24 jam
- ✅ Preview schedules menampilkan format 24 jam

### 3. Edit Existing Data
- ✅ Data lama dalam format 12 jam → dikonversi ke 24 jam saat edit
- ✅ Data lama dalam format 24 jam → tetap 24 jam
- ✅ Interval config time → dikonversi ke 24 jam

## Database Impact

### 1. New Records
- ✅ Semua schedules tersimpan dalam format 24 jam
- ✅ `scheduled_at` juga dalam format 24 jam
- ✅ `interval_config.time` dalam format 24 jam

### 2. Existing Records
- ✅ Saat edit, data lama dikonversi ke format 24 jam
- ✅ Tidak ada data yang hilang
- ✅ Backward compatibility terjaga

## Cron Job Compatibility

### 1. Auto Message Scheduler
- ✅ Menerima waktu dalam format 24 jam
- ✅ Tidak ada ambiguitas AM/PM
- ✅ Bisa memproses schedules dengan benar

### 2. Time Comparison
- ✅ `scheduled_at` dalam format ISO dengan timezone
- ✅ `schedules[].time` dalam format 24 jam (HH:MM)
- ✅ Perbandingan waktu yang akurat

## Best Practices

### 1. Always Use formatTimeTo24Hour
```javascript
// ✅ Good
const time = formatTimeTo24Hour(inputTime);

// ❌ Bad
const time = inputTime; // May be in 12-hour format
```

### 2. Validate Before Save
```javascript
// ✅ Good
formData.schedules = schedules.map(schedule => ({
  ...schedule,
  time: formatTimeTo24Hour(schedule.time)
}));
```

### 3. Log for Debugging
```javascript
// ✅ Good
console.log(`Time conversion: ${original} -> ${formatted}`);
```

## Migration Notes

### 1. Existing Data
- Data lama akan dikonversi saat di-edit
- Tidak perlu migration script khusus
- Backward compatibility terjaga

### 2. New Data
- Semua data baru dalam format 24 jam
- Konsisten di seluruh aplikasi
- Compatible dengan cron job

## Troubleshooting

### 1. Time Still in 12-hour Format
- Check if `formatTimeTo24Hour` is called
- Check console logs for conversion
- Verify input time format

### 2. Cron Job Not Running
- Check if schedules are in 24-hour format
- Check if `scheduled_at` is correct
- Verify timezone settings

### 3. Edit Not Working
- Check if existing data is converted
- Check console logs for errors
- Verify data format in database 