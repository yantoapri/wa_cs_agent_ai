<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar (desktop) -->
    <aside class="hidden md:flex md:flex-col md:w-16 md:bg-white md:border-r md:border-gray-200">
      <div class="flex items-center justify-center h-16 border-b border-gray-200">
        <img src="/assets/img/nutra.png" class="h-8 w-8" />
      </div>
      <nav class="flex-1 flex flex-col items-center py-4 space-y-2 overflow-y-auto">
       
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

    <!-- Mobile Sidebar Overlay -->
    <div v-if="mobileSidebarOpen" class="md:hidden fixed inset-0 z-50 flex">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-gray-600 bg-opacity-50" @click="closeMobileSidebar"></div>
      
      <!-- Sidebar -->
      <div class="relative flex flex-col w-64 h-full bg-white border-r border-gray-200 shadow-xl">
        <!-- Header - Fixed -->
        <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
          <img src="/assets/img/nutra.png" class="h-8 w-[80px]" />
          <button @click="closeMobileSidebar" class="p-2 rounded-lg hover:bg-gray-100">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Menu Items - Scrollable -->
        <nav class="flex-1 overflow-y-auto py-4 px-2">
          <template v-for="t in filteredTabs" :key="t.value">
            <NuxtLink :to="`/views/${t.value}`" @click="closeMobileSidebar"
              class="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg transition-all duration-200 focus:outline-none"
              :class="route.path.startsWith(`/views/${t.value}`) ? 'text-blue-600 bg-blue-50 border border-blue-200' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'">
              <span v-html="t.icon" class="flex-shrink-0"></span>
              <span class="text-sm font-medium">{{ t.label }}</span>
            </NuxtLink>
          </template>
        </nav>

        <!-- User Menu - Fixed at Bottom -->
        <div class="border-t border-gray-200 p-4 bg-white">
          <div class="relative">
            <button @click="toggleDropdown" class="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-50 focus:outline-none">
              <img :src="userAvatar" :alt="userName" class="w-8 h-8 rounded-full object-cover border-2 border-gray-200 flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 truncate">{{ userName }}</span>
              <svg class="w-4 h-4 ml-auto text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div v-if="dropdownOpen" class="absolute bottom-full left-0 right-0 mb-2 border border-gray-200 rounded-lg shadow-lg z-50 bg-white">
              <NuxtLink class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50" to="/doc" @click="closeMobileSidebar">Doc</NuxtLink>
              <button class="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50" @click="handleLogout">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main area -->
    <div class="flex flex-1 min-h-0 flex-col">
      <!-- Topbar (mobile) -->
      <div class="md:hidden flex items-center justify-between border-b border-gray-200 px-4 h-16 bg-white">
        <div class="flex items-center gap-3">
          <button @click="openMobileSidebar" class="p-2 rounded-lg hover:bg-gray-100 focus:outline-none">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src="/assets/img/nutra.png" class="h-8 w-[80px]" />
        </div>
        <!-- Mobile user menu - completely hidden -->
        <div style="display: none !important;" class="hidden">
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
  // hanya tampilkan dashboard dan payment
  return list.filter(t => t.value === 'dashboard' || t.value === 'payment')
})

const dropdownOpen = ref(false)
const mobileSidebarOpen = ref(false)
const userMenuRef = ref(null)

function toggleDropdown() { dropdownOpen.value = !dropdownOpen.value }
function closeDropdown() { dropdownOpen.value = false }
function openMobileSidebar() { mobileSidebarOpen.value = true }
function closeMobileSidebar() { 
  mobileSidebarOpen.value = false
  dropdownOpen.value = false
}

onClickOutside(userMenuRef, closeDropdown)

async function handleLogout() {
  try { await supabase.auth.signOut(); router.push('/login') } catch {}
}

// cek pembatasan akses
onMounted(async () => {
  console.log("cek pembatasan akses")
  try {
    if (!user?.value?.id) return
    const { data: userRow } = await supabase
      .from('users')
      .select('*,role(*)')
      .eq('auth_id', user.value.id)
      .maybeSingle()
    const role = userRow?.role.id
    const tmpIsSuperadmin = role === 1
    isSuperadmin.value = tmpIsSuperadmin
    const endAt = data?.end_at ? new Date(data.end_at).getTime() : null
    const now = new Date().getTime()
    restricted.value = !tmpIsSuperadmin && endAt !== null && endAt > now
    if(restricted.value) {
      filteredTabs.value = displayedTabs.value.filter(t => t.value === 'dashboard' || t.value === 'payment')
    }
  } catch {}
})
</script>
