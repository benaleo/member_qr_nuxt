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

  modules: ['@nuxt/ui'],

  runtimeConfig: {
    public: {
      // Change this to your Go GraphQL endpoint if different
      graphqlEndpoint: process.env.NUXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:8080/graphql'
    }
  }
  
})