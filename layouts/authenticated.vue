<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar (desktop) -->
    <aside class="hidden md:flex md:flex-col md:w-16 md:bg-white md:border-r md:border-gray-200">
      <div class="flex items-center justify-center h-16 border-b border-gray-200">
        <img src="/assets/img/nutra.png" class="h-8 w-8" />
      </div>
      <nav class="flex-1 flex flex-col items-center py-4 space-y-2">
       
        <template v-for="t in filteredTabs" :key="t.value">
          <NuxtLink :to="`/views/${t.value}`" class="w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none"
            :class="route.path.startsWith(`/views/${t.value}`) ? 'text-blue-600 bg-blue-50 border border-blue-200' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:border hover:border-blue-200'">
            <span v-html="t.icon"></span>
          </NuxtLink>
        </template>
      </nav>
      <div class="border-t border-gray-200 p-4">
        <div class="relative flex justify-center">
          <button @click="toggleDropdown" class="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-50 focus:outline-none">
            <img :src="userAvatar" :alt="userName" class="w-8 h-8 rounded-full object-cover border-2 border-gray-200" />
          </button>
          <div v-if="dropdownOpen" class="absolute left-full ml-2 top-0 w-40 border border-gray-200 rounded-lg shadow-lg z-50 bg-white">
            <NuxtLink class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50" to="/doc">Doc</NuxtLink>
            <button class="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50" @click="handleLogout">Logout</button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main area -->
    <div class="flex flex-1 min-h-0 flex-col">
      <!-- Topbar (mobile) -->
      <div class="md:hidden flex items-center justify-between border-b border-gray-200 px-4 h-16 bg-white">
        <div class="flex items-center">
          <div class="text-lg font-bold text-gray-800 mr-4">
            <img src="/assets/img/nutra.png" class="h-8 w-[80px]" />
          </div>
        </div>
        <div class="flex items-center gap-3 relative" ref="userMenuRef">
          <button @click="toggleDropdown" class="flex items-center gap-2 focus:outline-none">
            <img :src="userAvatar" :alt="userName" class="w-8 h-8 rounded-full object-cover border-2 border-gray-200" />
            <span class="text-sm font-medium text-gray-700">{{ userName }}</span>
            <svg class="w-4 h-4 ml-1 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="dropdownOpen" class="absolute right-0 top-12 w-40 border border-gray-200 rounded-lg shadow-lg z-50 bg-white">
            <NuxtLink class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50" to="/doc">Doc</NuxtLink>
            <button class="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50" @click="handleLogout">Logout</button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-h-0">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import { useSupabaseClient, useSupabaseUser } from '#imports'

const router = useRouter()
const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const baseTabs = [
  { value: 'dashboard', label: 'Dashboard', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>` },
  { value: 'inbox', label: 'Inbox', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>` },
  { value: 'kontak', label: 'Kontak', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>` },
  { value: 'chanel', label: 'Chanel', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/></svg>` },
  { value: 'chat', label: 'Chat', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>` },
  { value: 'produk', label: 'Produk', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>` },
  { value: 'agent-ai', label: 'Agent AI', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>` },
  { value: 'agent-manusia', label: 'Agent Manusia', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>` },
  { value: 'payment', label: 'Payment', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-credit-card-icon lucide-credit-card"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>` },
  { value: 'my-profile', label: 'My Profile', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>` },
]

const adminTabs = [
  { value: 'dashboard', label: 'Dashboard', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>` },
  { value: 'manage-user', label: 'Manage User', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4 0-7 2-7 5v1h14v-1c0-3-3-5-7-5z"/></svg>` },
  { value: 'manage-package', label: 'Manage Package', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12l-8 4-8-4m16 0l-8-4-8 4m0 0v6l8 4 8-4v-6"/></svg>` },
  { value: 'invoice-pembayaran', label: 'Invoice', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` },
]

const isSuperadmin = ref(false)
const displayedTabs = computed(() => (isSuperadmin.value ? adminTabs : baseTabs))

const userName = computed(() => user.value?.user_metadata?.name || user.value?.email?.split('@')[0] || 'User')
const userAvatar = computed(() => user.value?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${userName.value}&background=random`)

// Restrict menu when not superadmin and end_at >= now
const restricted = ref(false)
const filteredTabs = computed(() => {
  const list = displayedTabs.value
  if (!restricted.value) return list
  // hanya tampilkan dashboard
  return list.filter(t => t.value === 'dashboard')
})

const dropdownOpen = ref(false)
const userMenuRef = ref(null)
function toggleDropdown() { dropdownOpen.value = !dropdownOpen.value }
function closeDropdown() { dropdownOpen.value = false }
onClickOutside(userMenuRef, closeDropdown)

async function handleLogout() {
  try { await supabase.auth.signOut(); router.push('/login') } catch {}
}

// cek pembatasan akses
onMounted(async () => {
  try {
    if (!user?.value?.id) return
    const { data: userRow } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', user.value.id)
      .maybeSingle()
    const { data: pkg } = await supabase
      .from('user_package')
      .select('end_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    const role = userRow?.role
    const tmpIsSuperadmin = (typeof role === 'string' && role.toLowerCase() === 'superadmin') || role === 1
    isSuperadmin.value = tmpIsSuperadmin
    const endAt = pkg?.end_at ? new Date(pkg.end_at) : null
    const now = new Date()
    restricted.value = !tmpIsSuperadmin && endAt !== null && endAt >= now
  } catch {}
})
</script>
