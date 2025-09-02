<script setup lang="ts">
// Gamification page
import { onMounted, ref } from 'vue'
import { navigateTo } from 'nuxt/app'
import { getGamifications, type Gamification } from '@/api/gamification-api'

const loading = ref(false)
const error = ref('')
const list = ref<Gamification[]>([])

function qrUrl(code?: string) {
  if (!code) return ''
  // Generate QR via public API (no dependency). Size 200x200.
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(code)}`
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await getGamifications()
    list.value = res.items || []
  } catch (e: any) {
    error.value = e?.message || 'Gagal memuat data.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="min-h-screen p-6">
    <div class="mx-auto max-w-3xl space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Gamification</h1>
        <UButton color="primary" size="lg" icon="i-heroicons-arrow-left" @click="navigateTo('/console')">
          Back
        </UButton>
      </div>
      <UAlert v-if="error" color="error" variant="soft" :title="'Error'" :description="error" />
      <div v-if="loading" class="text-sm text-gray-500">Memuat...</div>

      <div class="grid gap-4 sm:grid-cols-2">
        <UCard v-for="item in list" :key="item.id" class="overflow-hidden">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="font-semibold">{{ item.name }}</div>
              <div class="text-pink-600 text-sm">+{{ item.point }} poin</div>
            </div>
          </template>
          <div class="grid gap-3 items-center">
            <div class="justify-center p-4 bg-white rounded">
              <img v-if="item.code" :src="qrUrl(item.code)" alt="QR" class="w-full aspect-square rounded border" />
              <div v-else class="text-xs text-gray-400">Tidak ada kode</div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>