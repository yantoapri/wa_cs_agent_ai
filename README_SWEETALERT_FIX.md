# SweetAlert Fix Documentation

## Masalah
Error `ReferenceError: Swal is not defined` terjadi di `ChatForm.vue` karena SweetAlert tidak diimport dengan benar.

## Solusi yang Diterapkan

### 1. Import SweetAlert
```javascript
import Swal from "sweetalert2";
```

### 2. Fallback Function
```javascript
// Fallback for SweetAlert if not available
const showAlert = (options) => {
  console.log('[ChatForm] showAlert called with options:', options);
  console.log('[ChatForm] Swal available:', typeof Swal !== 'undefined');
  console.log('[ChatForm] Swal.fire available:', typeof Swal !== 'undefined' && Swal.fire);
  
  if (typeof Swal !== "undefined" && Swal.fire) {
    console.log('[ChatForm] Using SweetAlert');
    return Swal.fire(options);
  } else {
    console.log('[ChatForm] Using fallback alert');
    // Fallback to native alert
    alert(options.text || options.title || "Alert");
    return Promise.resolve({ isConfirmed: true });
  }
};
```

### 3. Replace All Swal.fire Calls
Semua penggunaan `Swal.fire()` diganti dengan `showAlert()`:

#### Sebelum:
```javascript
Swal.fire({
  icon: "warning",
  title: "Peringatan",
  text: "Silakan pilih channel untuk mengirim pesan",
  confirmButtonText: "OK",
});
```

#### Sesudah:
```javascript
showAlert({
  icon: "warning",
  title: "Peringatan",
  text: "Silakan pilih channel untuk mengirim pesan",
  confirmButtonText: "OK",
});
```

## Dependencies

### 1. Package.json
```json
{
  "dependencies": {
    "sweetalert2": "^11.22.2"
  }
}
```

### 2. CSS Import (nuxt.config.ts)
```typescript
css: ["~/assets/css/main.css", "~/assets/css/sweetalert-custom.css"]
```

### 3. Custom CSS (assets/css/sweetalert-custom.css)
```css
/* Custom SweetAlert Styles */
.swal2-popup {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border-radius: 12px;
}

.swal2-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.swal2-html-container {
  font-size: 1rem;
  color: #6b7280;
}

.swal2-confirm {
  background-color: #dc2626 !important;
  border-radius: 8px !important;
  font-weight: 500 !important;
  padding: 12px 24px !important;
}

.swal2-cancel {
  background-color: #3b82f6 !important;
  border-radius: 8px !important;
  font-weight: 500 !important;
  padding: 12px 24px !important;
}

.swal2-confirm:hover {
  background-color: #b91c1c !important;
}

.swal2-cancel:hover {
  background-color: #2563eb !important;
}

.swal2-icon {
  border-width: 3px;
}

.swal2-icon.swal2-warning {
  border-color: #f59e0b;
  color: #f59e0b;
}
```

## Alert Types Used

### 1. Warning Alerts
- Channel validation
- Contact validation
- Phone number format validation
- Interval schedule validation

### 2. Error Alerts
- Phone number format error
- Form submission error

### 3. Success Alerts
- Form submission success

## Testing

### 1. Check Console Logs
```javascript
// Check if SweetAlert is loaded
console.log('Swal available:', typeof Swal !== 'undefined');
console.log('Swal.fire available:', typeof Swal !== 'undefined' && Swal.fire);
```

### 2. Test Alert Function
```javascript
// Test basic alert
showAlert({
  icon: "info",
  title: "Test",
  text: "This is a test alert",
  confirmButtonText: "OK"
});
```

### 3. Test Fallback
```javascript
// Test fallback when SweetAlert is not available
// This will use native alert
```

## Troubleshooting

### 1. SweetAlert Not Loading
- Check if `sweetalert2` is installed: `npm list sweetalert2`
- Check if import is correct: `import Swal from "sweetalert2"`
- Check browser console for errors

### 2. CSS Not Applied
- Check if CSS is imported in `nuxt.config.ts`
- Check if custom CSS file exists
- Check browser dev tools for CSS conflicts

### 3. Fallback Not Working
- Check if `showAlert` function is defined
- Check console logs for debugging info
- Verify fallback logic

## Best Practices

### 1. Always Use showAlert Function
```javascript
// ✅ Good
showAlert({
  icon: "warning",
  title: "Peringatan",
  text: "Message here",
  confirmButtonText: "OK"
});

// ❌ Bad
Swal.fire({
  icon: "warning",
  title: "Peringatan",
  text: "Message here",
  confirmButtonText: "OK"
});
```

### 2. Consistent Alert Options
```javascript
const alertOptions = {
  icon: "warning",
  title: "Peringatan",
  confirmButtonText: "OK",
  cancelButtonText: "Batal"
};
```

### 3. Error Handling
```javascript
try {
  // Some operation
} catch (error) {
  showAlert({
    icon: "error",
    title: "Error",
    text: error.message || "Terjadi kesalahan",
    confirmButtonText: "OK"
  });
}
```

## Migration Guide

### 1. Replace Swal.fire with showAlert
```bash
# Find all Swal.fire usage
grep -r "Swal\.fire" components/

# Replace manually or use sed
sed -i 's/Swal\.fire/showAlert/g' components/ChatForm.vue
```

### 2. Add Import
```javascript
import Swal from "sweetalert2";
```

### 3. Add Fallback Function
```javascript
const showAlert = (options) => {
  if (typeof Swal !== "undefined" && Swal.fire) {
    return Swal.fire(options);
  } else {
    alert(options.text || options.title || "Alert");
    return Promise.resolve({ isConfirmed: true });
  }
};
```

## Monitoring

### 1. Console Logs
- Check for `[ChatForm] showAlert called` messages
- Check for SweetAlert availability logs
- Check for fallback usage logs

### 2. Network Tab
- Check if SweetAlert2 is loaded from CDN
- Check for any failed requests

### 3. Performance
- Monitor alert rendering time
- Check for memory leaks with multiple alerts 