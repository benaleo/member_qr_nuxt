<script setup lang="ts">
const {$pwa} = useNuxtApp() as any

async function onInstall() {
  try {
    await $pwa?.install?.()
  } catch (e) {
    console.error('Install failed', e)
  }
}
</script>

<template>
  <div v-if="$pwa?.showInstallPrompt" class="fixed bottom-6 right-6 z-50">
    <UButton color="primary" icon="i-heroicons-arrow-down-tray" @click="onInstall">
      Install App
    </UButton>
  </div>
</template>
