// @ts-nocheck
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  modules: ["@nuxtjs/supabase"],

  // Konfigurasi untuk Cloudflare Pages
  nitro: {
    preset: "cloudflare-pages",
  },
  // Static generation untuk menghindari masalah server-side
  ssr: true,
  target: "static",

  // Runtime config untuk environment variables
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  },

  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    redirectOptions: {
      login: "/signin",
      callback: "/confirm",
      include: undefined,
      exclude: ["/*"],
      saveRedirectToCookie: false,
    },
  },
  css: ["~/assets/css/main.css"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  app: {
    head: {
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap",
        },
      ],
    },
  },
});
