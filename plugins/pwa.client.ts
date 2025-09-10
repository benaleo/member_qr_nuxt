import { watch } from 'vue'
import { toast } from 'vue-sonner'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  // $pwa is injected by @vite-pwa/nuxt when enabled
  const pwa: any = (nuxtApp as any).$pwa
  if (!pwa) return

  // Offline ready notification
  watch(pwa.offlineReady, (ready: boolean) => {
    if (ready) {
      toast.success('App is ready to work offline')
    }
  })

  // New content available -> prompt user to reload
  watch(pwa.needRefresh, (need: boolean) => {
    if (need) {
      toast('New content available', {
        description: 'Click to reload and update to the latest version.',
        action: {
          label: 'Reload',
          onClick: () => pwa.updateServiceWorker(true)
        }
      })
    }
  })

  // Intercept install prompt and show a custom toast action
  watch(pwa.showInstallPrompt, (show: boolean) => {
    if (show) {
      toast('Install this app?', {
        description: 'Add this app to your home screen for a better experience.',
        action: {
          label: 'Install',
          onClick: async () => {
            try {
              await pwa.install()
            } catch (e) {
              console.error('PWA install failed', e)
            }
          }
        }
      })
    }
  })

  // Optional: notify if service worker registration fails
  watch(pwa.registrationError, (err: boolean) => {
    if (err) {
      toast.error('Service Worker registration failed')
    }
  })
})
