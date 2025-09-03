<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { navigateTo } from 'nuxt/app'
import { getUsers, approvalUser, type User } from '@/api/user-api'

const keyword = ref<string>('')
const typing = ref(false)
const users = ref<User[]>([])
const page = ref(1)
const limit = 10
const loading = ref(false)
const error = ref('')
const hasMore = ref(true)

// local active state map to reflect toggle immediately
const activeMap = ref<Record<number, boolean>>({})

function userActive(u: User): boolean {
  // @ts-ignore: backend may provide is_active; otherwise fallback to map or false
  const backendActive = (u as any)?.is_active as boolean | undefined
  if (typeof backendActive === 'boolean') return backendActive
  return activeMap.value[u.id] ?? false
}

function setUserActive(u: User, v: boolean) {
  activeMap.value[u.id] = v
}

async function fetchUsers(reset = false) {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try {
    if (reset) {
      page.value = 1
      users.value = []
      hasMore.value = true
    }
    const list = await getUsers(keyword.value || undefined, page.value, limit)
    const items = list.items || []
    users.value = reset ? items : users.value.concat(items)
    // infer hasMore from received count
    if (items.length < limit) hasMore.value = false
    // seed local active map if backend sends is_active
    for (const u of items) {
      // @ts-ignore optional
      if (typeof (u as any)?.is_active === 'boolean') activeMap.value[u.id] = (u as any).is_active
    }
  } catch (e: any) {
    error.value = e?.message || 'Gagal memuat user'
  } finally {
    loading.value = false
  }
}

function onSearchInput() {
  typing.value = true
}

// debounce search
let debounceTimer: any
watch(keyword, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    typing.value = false
    fetchUsers(true)
  }, 400)
})

async function toggleApproval(u: User) {
  const current = userActive(u)
  try {
    // optimistic update
    setUserActive(u, !current)
    await approvalUser(u.id, !current)
  } catch (e) {
    // revert
    setUserActive(u, current)
    window.alert((e as any)?.message || 'Gagal mengubah status user')
  }
}

async function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value += 1
  await fetchUsers(false)
}

onMounted(() => fetchUsers(true))
</script>

<template>
  <div class="min-h-screen p-6">
    <div class="mx-auto max-w-3xl space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Members</h1>
        <UButton color="neutral" icon="i-heroicons-arrow-left" @click="navigateTo('/console')">Back</UButton>
      </div>

      <UAlert v-if="error" color="error" variant="soft" :title="'Error'" :description="error" />

      <div class="flex gap-2">
        <UInput v-model="keyword" class="form-input" placeholder="Cari nama/username..." @input="onSearchInput" />
        <UButton color="primary" :loading="loading" @click="fetchUsers(true)">Search</UButton>
      </div>

      <div v-if="loading && users.length === 0" class="text-sm text-gray-500">Memuat...</div>

      <div class="grid gap-3">
        <UCard v-for="u in users" :key="u.id">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img v-if="u.avatar" :src="u.avatar" class="w-10 h-10 rounded-full object-cover border" alt="avatar" />
              <div v-else class="w-10 h-10 rounded-full bg-gray-200 grid place-items-center text-gray-500">{{ u.name?.[0] || u.username?.[0] || '?' }}</div>
              <div>
                <div class="font-medium">{{ u.name || u.username }}</div>
                <div class="text-xs text-gray-500">@{{ u.username }}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <UBadge :color="userActive(u) ? 'success' : 'warning'">{{ userActive(u) ? 'Active' : 'Inactive' }}</UBadge>
              <UButton :color="userActive(u) ? 'error' : 'primary'" @click="toggleApproval(u)">
                {{ userActive(u) ? 'Deactivate' : 'Activate' }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <div class="flex justify-center" v-if="hasMore && users.length">
        <UButton color="neutral" :loading="loading" @click="loadMore">Load more</UButton>
      </div>
    </div>
  </div>
</template>
