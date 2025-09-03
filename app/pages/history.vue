<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCookie } from 'nuxt/app'
import { getLogGamifications, type LogItem, type LogList } from '@/api/gamification-api'

definePageMeta({ layout: 'mobile' })

const items = ref<LogItem[]>([])
const pageInfo = ref<LogList['page_info'] | null>(null)
const page = ref(1)
const limit = 10
const loading = ref(false)
const error = ref('')

async function load(p = 1) {
  const userIdStr = useCookie<string | null>('auth_user_id').value
  const userId = userIdStr ? parseInt(userIdStr, 10) : NaN
  if (!userId || Number.isNaN(userId)) {
    error.value = 'User belum login.'
    return
  }

  loading.value = true
  error.value = ''
  try {
    const res = await getLogGamifications(userId, p, limit)
    pageInfo.value = res.page_info
    page.value = res.page_info.current_page
    if (p === 1) items.value = res.items || []
    else items.value = [...items.value, ...(res.items || [])]
  } catch (e: any) {
    error.value = e?.message || 'Gagal memuat riwayat.'
  } finally {
    loading.value = false
  }
}

function loadMore() {
  if (pageInfo.value?.has_next_page) {
    load((page.value || 1) + 1)
  }
}

onMounted(() => load(1))
</script>

<template>
  <div class="mx-auto max-w-sm px-4 pt-6 pb-4">
    <h1 class="text-xl font-semibold mb-4">Riwayat</h1>
    <div class="space-y-3">
      <UAlert v-if="error" color="error" variant="soft" :title="'Error'" :description="error" />
      <div v-if="loading && items.length === 0" class="text-sm text-gray-500">Memuat...</div>
      <div v-if="!loading && items.length === 0" class="text-sm text-gray-500">Belum ada riwayat.</div>

      <UCard v-for="it in items" :key="it.id">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">{{ it.gamification?.name }}</div>
            <div class="text-xs text-gray-500">{{ it.message }}</div>
          </div>
          <div class="text-pink-600 font-semibold">+{{ it.point }}</div>
        </div>
      </UCard>

      <div class="pt-2">
        <UButton v-if="pageInfo?.has_next_page" :loading="loading" color="secondary" block @click="loadMore">
          Muat lagi
        </UButton>
      </div>
    </div>
  </div>
  <MobileNav/>
</template>
