<script setup lang="ts">
// Gamification page
import { onMounted, ref } from 'vue'
import { navigateTo } from 'nuxt/app'
import { getGamifications, type Gamification } from '@/api/gamification-api'

const loading = ref(false)
const error = ref('')
const list = ref<Gamification[]>([])
// Map of code -> image src (dataURL or remote URL)
const qrSrcMap = ref<Record<string, string>>({})

function qrUrl(code?: string) {
  if (!code) return ''
  // Generate QR via public API (no dependency). Size 200x200.
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(code)}`
}

function cacheKey(code: string) {
  return `qr_img:${code}`
}

function loadFromCache(code: string): string | null {
  try {
    return localStorage.getItem(cacheKey(code))
  } catch {
    return null
  }
}

async function fetchAndCacheQr(code: string) {
  const url = qrUrl(code)
  try {
    const res = await fetch(url, { cache: 'force-cache' })
    if (!res.ok) throw new Error('Gagal mengambil QR')
    const blob = await res.blob()
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    try {
      localStorage.setItem(cacheKey(code), dataUrl)
    } catch {
      // ignore quota errors
    }
    qrSrcMap.value[code] = dataUrl
  } catch {
    // On failure, fall back to remote URL
    qrSrcMap.value[code] = url
  }
}

async function ensureQrForList(items: Gamification[]) {
  const codes = items.map(i => i.code).filter((c): c is string => !!c)
  for (const code of codes) {
    const cached = loadFromCache(code)
    if (cached) {
      qrSrcMap.value[code] = cached
    } else {
      // optimistic show remote url while fetching and caching
      qrSrcMap.value[code] = qrUrl(code)
      fetchAndCacheQr(code)
    }
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await getGamifications()
    list.value = res.items || []
    await ensureQrForList(list.value)
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
              <img v-if="item.code" :src="qrSrcMap[item.code] || qrUrl(item.code)" alt="QR" class="w-full aspect-square rounded border" />
              <div v-else class="text-xs text-gray-400">Tidak ada kode</div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>