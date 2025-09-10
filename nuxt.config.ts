// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: ['@nuxt/ui', '@vite-pwa/nuxt'],

  pwa: {
    registerType: 'autoUpdate',
    registerWebManifestInRouteRules: true,
    devOptions: {
      enabled: false
    },
    client: {
      installPrompt: true,
    },
    manifest: {
      name: 'Nuxt App',
      short_name: 'NuxtApp',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#0ea5e9'
    },
    // Generate and inject PWA icons/assets from a single source image
    pwaAssets: {
      image: 'public/logo.svg',
      overrideManifestIcons: false
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}']
    },
    experimental: {
      enableWorkboxPayloadQueryParams: true
    }
  },

  runtimeConfig: {
    public: {
      // Change this to your Go GraphQL endpoint if different
      graphqlEndpoint: process.env.NUXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:8080/graphql'
    }
  }
  
})