// @ts-nocheck
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  modules: ["@nuxtjs/supabase"],
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  ssr: true,

  // Runtime config untuk environment variables
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
      baseUrl: process.env.VITE_BASE_URL,
    },
    // Server-side environment variables
    supabaseServiceRoleKey: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    openAiKey: process.env.OPEN_AI_KEY,
    wahaBaseUrl: process.env.VITE_BASE_URL_WAHA,
    wahaApiKey: process.env.VITE_WAHA_API,
    wahaUsername: process.env.VITE_WAHA_USERNAME,
    wahaPassword: process.env.VITE_WAHA_PASSWORD,
    // SMTP configuration
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    apiKeyEmail: process.env.API_KEY_EMAIL,
    email: process.env.EMAIL,
    apiUrlEmail: process.env.API_URL_EMAIL,
  },

  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    redirectOptions: {
      login: "/signin",
      callback: "/confirm",
      include: undefined,
      exclude: ["/*"],
      saveRedirectToCookie: false,
    },
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { charset: 'utf-8' }
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
      title: "Nutra AI Chat",
      htmlAttrs: {
        lang: "id",
      },
    },
  },
  css: ["~/assets/css/main.css", "~/assets/css/sweetalert-custom.css"],
});
