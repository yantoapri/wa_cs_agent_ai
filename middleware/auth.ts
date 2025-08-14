export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser();
  if (!user.value && !["/login", "/register"].includes(to.path)) {
    return navigateTo("/login");
  }
  // Jika belum login, cukup biarkan guard di atas bekerja
  if (!user.value) return

  // Batasi akses ketika: role bukan superadmin DAN end_at >= now
  try {
    const supabase = useSupabaseClient()

    // Ambil role user
    const { data: userRow } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', user.value.id)
      .maybeSingle()

    // Ambil periode paket terakhir
    const { data: pkg } = await supabase
      .from('user_package')
      .select('end_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const role = userRow?.role
    const isSuperadmin = (typeof role === 'string' && role.toLowerCase() === 'superadmin') || role === 1
    const endAt = pkg?.end_at ? new Date(pkg.end_at) : null
    const now = new Date()

    const restricted = !isSuperadmin && endAt !== null && endAt >= now

    if (restricted) {
      // Hanya izinkan dashboard dan payment
      const allowed = [
        '/views',
        '/views/',
        '/views/dashboard',
        '/pricing/payment',
        '/login',
        '/register',
      ]
      const isAllowed = allowed.some((p) => to.path === p || to.path.startsWith('/pricing/payment'))
      if (!isAllowed) {
        return navigateTo('/views/dashboard')
      }
    }
  } catch {
    // Abaikan error, default ke perilaku normal
  }
});
