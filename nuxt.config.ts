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
      name: 'Relextension',
      short_name: 'Relextension',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#0ea5e9',
      icons: [
        {
          src: '/pwa-assets/manifest-icon-192.maskable.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/pwa-assets/manifest-icon-512.maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    // Generate and inject PWA icons/assets from a single source image
    pwaAssets: {
      image: 'public/pwa-assets/pwa-icon.png',
      overrideManifestIcons: false
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}']
    },
    experimental: {
      enableWorkboxPayloadQueryParams: true
    }
  },

  // Ensure PWA assets are correctly served in preview/production
  nitro: {
    prerender: {
      routes: ['/manifest.webmanifest']
    }
  },

  // Avoid SPA fallback for PWA assets so Vue Router doesn't warn
  routeRules: {
    '/manifest.webmanifest': {
      headers: {
        'Content-Type': 'application/manifest+json'
      }
    },
    '/sw.js': { isr: false },
    '/workbox-*': { isr: false }
  },

  runtimeConfig: {
    public: {
      // Change this to your Go GraphQL endpoint if different
      graphqlEndpoint: process.env.NUXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:8080/graphql'
    }
  }
  
})