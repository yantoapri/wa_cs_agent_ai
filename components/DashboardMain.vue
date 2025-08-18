<template>
  <div class="p-4 md:p-6 bg-gray-100 h-full overflow-auto">
    <!-- Superadmin: hanya welcome -->
    <div v-if="isSuperadmin" class="h-full flex items-center justify-center">
      <div class="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
        <h1 class="text-2xl font-bold">Welcome back, Superadmin</h1>
        <p class="text-gray-600 mt-2">Gunakan menu untuk mengelola pengguna, paket, dan invoice.</p>
      </div>
    </div>

    <!-- Client: tampilkan dashboard penuh -->
    <div v-else class="space-y-6">
      <!-- Kartu informasi paket -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="text-sm text-gray-500">Paket Anda</div>
        <div class="mt-1 flex flex-wrap items-center gap-3">
          <div class="text-xl font-semibold capitalize">{{ userPackageValue?.name || 'Tidak diketahui' }}</div>
        </div>
        
        <div v-if="is_trial||new Date(dashboard.endAt)>=new Date()" class="mt-4 p-4 border rounded-lg bg-blue-50 text-blue-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div class="font-medium" >Masa aktif paket anda 
            {{ new Date(dashboard.startAt).toLocaleDateString() }} - {{ new Date(dashboard.endAt).toLocaleDateString() }}</div>
            <div class="font-medium" v-if="new Date().getTime()>=new Date(dashboard.endAt).getTime()">Peringatan masa aktif paket anda sudah habis</div>
            <div class="text-sm text-blue-700">Upgrade paket untuk membuka semua fitur tanpa batasan.</div>
          </div>
          <button @click="goUpgrade" class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Upgrade Paket</button>
        </div>
      </div>

      <!-- Kartu metrik di bawah paket -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Chat Message AI -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center">
          <div class="text-sm text-gray-500">Chat Message AI</div>
          <div class="mt-3 relative w-36 h-36">
            <svg class="w-36 h-36 transform -rotate-90">
              <circle cx="72" cy="72" r="42" stroke="#E5E7EB" stroke-width="12" fill="none" />
              <circle cx="72" cy="72" r="42" stroke="#2563EB" stroke-width="12" fill="none"
                :stroke-dasharray="circleCirc"
                :stroke-dashoffset="getProgressOffset(dashboard.percentRemaining)"
                stroke-linecap="round" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <div class="text-2xl font-bold">{{ dashboard.percentRemaining }}%</div>
              <div class="text-xs text-gray-500">Sisa</div>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600">
            {{ dashboard.remaining }} sisa dari {{ dashboard.limit }} pesan
          </div>
          <div class="text-xs text-gray-500">Digunakan: {{ dashboard.aiMessagesCount }}</div>
        </div>

        <!-- Agent AI -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center">
          <div class="text-sm text-gray-500">Agent AI</div>
          <div class="mt-3 relative w-36 h-36">
            <svg class="w-36 h-36 transform -rotate-90">
              <circle cx="72" cy="72" r="42" stroke="#E5E7EB" stroke-width="12" fill="none" />
              <circle cx="72" cy="72" r="42" stroke="#10B981" stroke-width="12" fill="none"
                :stroke-dasharray="circleCirc"
                :stroke-dashoffset="getProgressOffset(dashboard.agentPercentRemaining)"
                stroke-linecap="round" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <div class="text-2xl font-bold">{{ dashboard.agentPercentRemaining }}%</div>
              <div class="text-xs text-gray-500">Sisa</div>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600">
            {{ dashboard.agentRemaining }} sisa dari {{ dashboard.agentLimit }} agent
          </div>
          <div class="text-xs text-gray-500">Digunakan: {{ dashboard.agentsAICount }}</div>
        </div>

        <!-- Chanel -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center">
          <div class="text-sm text-gray-500">Chanel</div>
          <div class="mt-3 relative w-36 h-36">
            <svg class="w-36 h-36 transform -rotate-90">
              <circle cx="72" cy="72" r="42" stroke="#E5E7EB" stroke-width="12" fill="none" />
              <circle cx="72" cy="72" r="42" stroke="#F59E0B" stroke-width="12" fill="none"
                :stroke-dasharray="circleCirc"
                :stroke-dashoffset="getProgressOffset(dashboard.chanelPercentRemaining)"
                stroke-linecap="round" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <div class="text-2xl font-bold">{{ dashboard.chanelPercentRemaining }}%</div>
              <div class="text-xs text-gray-500">Sisa</div>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600">
            {{ dashboard.chanelRemaining }} sisa dari {{ dashboard.chanelLimit }} chanel
          </div>
          <div class="text-xs text-gray-500">Digunakan: {{ dashboard.chanelCount }}</div>
        </div>

        <!-- Broadcast -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center">
          <div class="text-sm text-gray-500">Broadcast</div>
          <div class="mt-3 relative w-36 h-36">
            <svg class="w-36 h-36 transform -rotate-90">
              <circle cx="72" cy="72" r="42" stroke="#E5E7EB" stroke-width="12" fill="none" />
              <circle cx="72" cy="72" r="42" stroke="#3B82F6" stroke-width="12" fill="none"
                :stroke-dasharray="circleCirc"
                :stroke-dashoffset="getProgressOffset(dashboard.broadcastPercentRemaining)"
                stroke-linecap="round" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <div class="text-2xl font-bold">{{ dashboard.broadcastPercentRemaining }}%</div>
              <div class="text-xs text-gray-500">Sisa</div>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600">
            {{ dashboard.broadcastRemaining }} sisa dari {{ dashboard.broadcastLimit }} broadcast
          </div>
          <div class="text-xs text-gray-500">Digunakan: {{ dashboard.broadcastCount }}</div>
        </div>

        <!-- Produk -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center">
          <div class="text-sm text-gray-500">Produk</div>
          <div class="mt-3 relative w-36 h-36">
            <svg class="w-36 h-36 transform -rotate-90">
              <circle cx="72" cy="72" r="42" stroke="#E5E7EB" stroke-width="12" fill="none" />
              <circle cx="72" cy="72" r="42" stroke="#8B5CF6" stroke-width="12" fill="none"
                :stroke-dasharray="circleCirc"
                :stroke-dashoffset="getProgressOffset(dashboard.productPercentRemaining)"
                stroke-linecap="round" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <div class="text-2xl font-bold">{{ dashboard.productPercentRemaining }}%</div>
              <div class="text-xs text-gray-500">Sisa</div>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600">
            {{ dashboard.productRemaining }} sisa dari {{ dashboard.productLimit }} produk
          </div>
          <div class="text-xs text-gray-500">Digunakan: {{ dashboard.productCount }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { useRouter } from 'vue-router'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const isSuperadmin = ref(false)

const dashboard = reactive({
  // counts
  chanelCount: 0,
  agentsAICount: 0,
  aiMessagesCount: 0,
  broadcastCount: 0,
  productCount: 0,
  // plan & period
  plan: null,
  startAt: null,
  endAt: null,
  // AI message limit & progress
  limit: 1000,
  remaining: 0,
  percentRemaining: 100,
  // Agent limit & progress
  agentLimit: 0,
  agentRemaining: 0,
  agentPercentRemaining: 100,
  // Chanel limit & progress (menggunakan limit_agent)
  chanelLimit: 0,
  chanelRemaining: 0,
  chanelPercentRemaining: 100,
  // Broadcast limit & progress
  broadcastLimit: 0,
  broadcastRemaining: 0,
  broadcastPercentRemaining: 100,
  // Product limit & progress
  productLimit: 0,
  productRemaining: 0,
  productPercentRemaining: 100,
})

const circleRadius = 42
const circleCirc = 2 * Math.PI * circleRadius
function getProgressOffset(percent) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0))
  return circleCirc * (1 - p / 100)
}

// nilai fallback jika relasi package tidak ditemukan
const planLimits = { pro: 10000, business: 50000, corporate: 200000 }
const is_trial=ref(false)
const userPackageValue = ref(null)

async function fetchUserPackage() {
  try {
    if (!user?.value?.id) {
      userPackageValue.value = null
      return
    }
    // Ambil data user beserta relasi package (untuk akses limit_* dan role)
    const { data, error } = await supabase
      .from('users')
      .select('*,package(*)')
      .eq('auth_id', user.value.id)
      .maybeSingle()
      dashboard.startAt=data.start_at;
      dashboard.endAt=data.end_at;
      userPackageValue.value=data.package
      is_trial.value=data.is_trial;
    if (error) {
      userPackageValue.value = null
      return
    }

    // Deteksi superadmin
    const role = data?.role
    const tmpIsSuperadmin = (typeof role === 'string' && role?.toLowerCase() === 'superadmin') || role === 1
    isSuperadmin.value = !!tmpIsSuperadmin

    // Jika superadmin: stop, jangan load data apapun
    if (isSuperadmin.value) return

    // Jika client: lanjutkan load data dashboard
    userPackageValue.value = data?.package || null

   
    // Plan dari package/invoice
    dashboard.plan = data?.package?.name || null

    // Limits dari package
    const limitAI = data?.package?.limit_ai ?? 0
    const limitAgent = data?.package?.limit_agent ?? 0
    const limitBroadcast = data?.package?.limit_broadcast ?? 0
    const limitProduk = data?.package?.limit_produk ?? 0

    // Set limit AI message
    dashboard.limit = (typeof limitAI === 'number' && !isNaN(limitAI)) ? limitAI : (planLimits[dashboard.plan] || 1000)

    // Count Chanel
    const { count: chanelCount } = await supabase
      .from('chanels')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.value.id)
      .eq("is_active.,true")
    dashboard.chanelCount = chanelCount || 0

    // Count Agent AI
    const { count: agentsAICount } = await supabase
      .from('agents')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'ai')
      .eq('created_by', user.value.id)
    dashboard.agentsAICount = agentsAICount || 0

    // Count AI messages
    const { count: aiMessagesCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('agent_type', 'ai')
      .eq('created_by', user.value.id)
    dashboard.aiMessagesCount = aiMessagesCount || 0

    // Count Broadcast
    const { count: broadcastCount } = await supabase
      .from('broadcast_messages')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', user.value.id)
    dashboard.broadcastCount = broadcastCount || 0

    // Count Product
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.value.id)
    dashboard.productCount = productCount || 0

    // Hitung sisa & persen untuk AI messages
    const remainingAI = Math.max(0, dashboard.limit - dashboard.aiMessagesCount)
    dashboard.remaining = remainingAI
    dashboard.percentRemaining = dashboard.limit > 0
      ? Math.max(0, Math.min(100, Math.round((remainingAI / dashboard.limit) * 100)))
      : 0

    // Agent (gunakan limit_agent)
    dashboard.agentLimit = limitAgent
    const remainingAgent = Math.max(0, dashboard.agentLimit - dashboard.agentsAICount)
    dashboard.agentRemaining = remainingAgent
    dashboard.agentPercentRemaining = dashboard.agentLimit > 0
      ? Math.max(0, Math.min(100, Math.round((remainingAgent / dashboard.agentLimit) * 100)))
      : 0

    // Chanel (menggunakan limit_agent)
    dashboard.chanelLimit = limitAgent
    const remainingChanel = Math.max(0, dashboard.chanelLimit - dashboard.chanelCount)
    dashboard.chanelRemaining = remainingChanel
    dashboard.chanelPercentRemaining = dashboard.chanelLimit > 0
      ? Math.max(0, Math.min(100, Math.round((remainingChanel / dashboard.chanelLimit) * 100)))
      : 0

    // Broadcast
    dashboard.broadcastLimit = limitBroadcast
    const remainingBroadcast = Math.max(0, dashboard.broadcastLimit - dashboard.broadcastCount)
    dashboard.broadcastRemaining = remainingBroadcast
    dashboard.broadcastPercentRemaining = dashboard.broadcastLimit > 0
      ? Math.max(0, Math.min(100, Math.round((remainingBroadcast / dashboard.broadcastLimit) * 100)))
      : 0

    // Produk
    dashboard.productLimit = limitProduk
    const remainingProduct = Math.max(0, dashboard.productLimit - dashboard.productCount)
    dashboard.productRemaining = remainingProduct
    dashboard.productPercentRemaining = dashboard.productLimit > 0
      ? Math.max(0, Math.min(100, Math.round((remainingProduct / dashboard.productLimit) * 100)))
      : 0
  } catch (e) {
    console.error('fetchUserPackage error', e)
    userPackageValue.value = null
  }
}

function goUpgrade() {
  router.push('/views/payment?plan='+dashboard.plan)
}

onMounted(async () => {
  await fetchUserPackage()
})
</script>