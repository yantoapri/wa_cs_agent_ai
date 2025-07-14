export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser();
  if (!user.value && !["/login", "/register"].includes(to.path)) {
    return navigateTo("/login");
  }
});
