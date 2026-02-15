import { defineNuxtConfig } from "nuxt/config";

// Auth package — Nuxt module that provides Sidebase Nuxt Auth configuration
export default defineNuxtConfig({
  modules: ["@sidebase/nuxt-auth"],
  auth: {
    isEnabled: true,
    baseURL: process.env.NUXT_PUBLIC_APP_URL || "http://localhost:3000",
    provider: {
      type: "authjs",
    },
    globalAppMiddleware: {
      isEnabled: false, // Set to true to protect all pages by default
    },
  },
});
