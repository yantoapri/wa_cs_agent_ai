# Integrasi Supabase - OsmoChat

Panduan lengkap untuk mengintegrasikan aplikasi OsmoChat dengan database Supabase.

## 🚀 Setup Awal

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 2. Setup Environment Variables

Buat file `.env` di root project dan tambahkan konfigurasi Supabase:

```env
# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPEN_AI_KEY=your_openai_api_key

# WhatsApp Integration
VITE_BASE_URL_WAHA=http://localhost:3000
```

### 3. Setup Database

Jalankan migrations Supabase untuk membuat struktur database:

```bash
# Install Supabase CLI
npm install -g supabase

# Login ke Supabase
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_ID

# Jalankan migrations
supabase db push
```

## 📁 Struktur File

### Composables

- `composables/useSupabase.ts` - Konfigurasi client Supabase dan types
- `composables/useChanelstore.ts` - Operasi CRUD untuk chanels
- `composables/useAgentStore.ts` - Operasi CRUD untuk agents (AI & Manusia)
- `composables/useAgentAIStore.ts` - Operasi khusus untuk AI agent configurations

### Migrations

- `supabase/migrations/001_initial_schema.sql` - Schema database dasar
- `supabase/migrations/002_add_whatsapp_integration.sql` - Integrasi WhatsApp
- `supabase/migrations/003_add_views_and_functions.sql` - Views dan functions

## 🔧 Cara Menggunakan

### 1. chanels

#### Tambah chanel Baru

```javascript
import { useChanelstore } from "~/composables/useChanels";

const { addchanel } = useChanelstore();

const newchanel = await addchanel({
  name: "WhatsApp chanel 1",
  type: "whatsapp",
  icon_url: "https://img.icons8.com/color/48/000000/whatsapp.png",
  whatsapp_number: "",
  takeover_ai: false,
  waktu_takeover: 0,
  limit_balasan_ai: false,
  maksimum_balasan_ai: 0,
});
```

#### Ambil Semua chanels

```javascript
import { useChanelstore } from "~/composables/useChanels";

const { chanels, fetchchanels } = useChanelstore();

// Load chanels
await fetchchanels();

// Access chanels data
console.log(chanels.value);
```

#### Update chanel

```javascript
import { useChanelstore } from "~/composables/useChanels";

const { updatechanel } = useChanelstore();

await updatechanel(chanelId, {
  name: "Updated chanel Name",
  takeover_ai: true,
  waktu_takeover: 5,
});
```

### 2. Agents

#### Tambah Agent AI

```javascript
import { useAgentStore } from "~/composables/useAgents";

const { addAgent } = useAgentStore();

const newAIAgent = await addAgent({
  name: "AI Bot 1",
  type: "ai",
  status: "offline",
  avatar_url: "https://i.pravatar.cc/40?img=7",
  description: "AI Assistant untuk customer service",
  kepintaran: "Advanced",
  is_active: true,
});
```

#### Tambah Agent Manusia

```javascript
import { useAgentStore } from "~/composables/useAgents";

const newHumanAgent = await addAgent({
  name: "Agent 1",
  type: "manusia",
  status: "online",
  avatar_url: "https://i.pravatar.cc/40?img=9",
  description: "Customer service agent",
  kepintaran: "Basic",
  is_active: true,
});
```

#### Ambil Agents by Type

```javascript
import { useAgentStore } from "~/composables/useAgents";

const { aiAgents, humanAgents, fetchAgentsByType } = useAgentStore();

// Load AI agents
await fetchAgentsByType("ai");

// Load human agents
await fetchAgentsByType("manusia");

// Access data
console.log(aiAgents.value);
console.log(humanAgents.value);
```

### 3. AI Agent Configurations

#### Save AI Configuration

```javascript
import { useAgentAIStore } from "~/composables/useAgentAI";

const { saveAIConfig } = useAgentAIStore();

await saveAIConfig(agentId, {
  gaya_bicara: "Saya adalah AI assistant yang ramah dan membantu.",
  pengetahuan:
    "Saya memiliki pengetahuan tentang produk dan layanan perusahaan.",
  handover_conditions: [
    { id: 1, text: "customer ingin berbicara dengan manusia" },
    { id: 2, text: "pertanyaan kompleks tentang teknis" },
  ],
  followup_configs: [
    {
      keyword: "order",
      mode: "generate",
      reply: "Baik, saya akan membantu Anda dengan pemesanan",
      delay: "5 detik",
    },
  ],
  kirim_gambar_configs: [
    {
      keyword: "katalog",
      imageUrl: "https://example.com/catalog.jpg",
    },
  ],
});
```

#### Get AI Configuration

```javascript
import { useAgentAIStore } from "~/composables/useAgentAI";

const { getAIConfigByAgentId } = useAgentAIStore();

const aiConfig = await getAIConfigByAgentId(agentId);
console.log(aiConfig);
```

## 🔄 Update Komponen

### chanelList.vue

- ✅ Menggunakan `useChanels` composable
- ✅ CRUD operations untuk chanels
- ✅ Real-time data dari database

### AgentAIList.vue

- ✅ Menggunakan `useAgents` composable
- ✅ Add AI agents ke database
- ✅ Real-time data dari database

### AgentManusiaList.vue

- ✅ Menggunakan `useAgents` composable
- ✅ Add human agents ke database
- ✅ Real-time data dari database

### AgentAIMain.vue

- ✅ Menggunakan `useAgentAI` composable
- ✅ Save AI configurations ke database
- ✅ Load AI configurations dari database
- ✅ Real-time sync dengan database

## 🛠️ Troubleshooting

### 1. Error: "Failed to fetch chanels"

- Pastikan environment variables sudah diset dengan benar
- Cek koneksi internet
- Pastikan Supabase project aktif

### 2. Error: "Failed to add chanel"

- Pastikan semua required fields terisi
- Cek RLS policies di Supabase
- Pastikan user memiliki permission yang cukup

### 3. Data tidak muncul

- Pastikan migrations sudah dijalankan
- Cek apakah ada data di database
- Refresh halaman atau restart aplikasi

### 4. TypeScript errors

- Pastikan types sudah di-generate dari Supabase
- Jalankan: `supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts`

## 📊 Monitoring

### Database Performance

- Monitor query performance di Supabase dashboard
- Gunakan views untuk query yang kompleks
- Set up alerts untuk error rates

### Application Logs

- Monitor console logs untuk error
- Track API calls ke Supabase
- Monitor user interactions

## 🔒 Security

### Row Level Security (RLS)

Semua tabel memiliki RLS enabled. Untuk production, sesuaikan policies:

```sql
-- Contoh policy yang lebih aman
CREATE POLICY "Users can only access their own data" ON users
FOR ALL USING (auth.uid() = id);
```

### Environment Variables

- Jangan commit file `.env` ke repository
- Gunakan `.env.example` sebagai template
- Rotate API keys secara berkala

## 🚀 Deployment

### 1. Production Environment

```bash
# Set production environment variables
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

### 2. Database Migration

```bash
# Deploy migrations ke production
supabase db push --project-ref YOUR_PROJECT_ID
```

### 3. Generate Types

```bash
# Generate types untuk production
supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
```

## 📝 Notes

- Semua data sekarang tersimpan di database Supabase
- Tidak ada lagi penggunaan localStorage untuk data utama
- Real-time sync antara frontend dan database
- Backup otomatis oleh Supabase
- Scalable dan production-ready

## 🤝 Support

Untuk pertanyaan atau masalah terkait integrasi Supabase:

1. Cek dokumentasi Supabase
2. Review error logs
3. Hubungi tim development
4. Buat issue di repository
