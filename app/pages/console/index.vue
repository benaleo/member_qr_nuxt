<script setup lang="ts">
import { NuxtLink } from '#components';

// Admin console

const authToken = useCookie<string | null>('auth_token')

function logout() {
  // Clear auth token cookie and redirect to home/login
  authToken.value = null
  navigateTo('/')
}
</script>

<template>
  <div class="min-h-screen p-6">
    <div class="mx-auto max-w-3xl space-y-2">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold">Admin Console</h1>
        <UButton color="error" icon="i-heroicons-arrow-right-on-rectangle" @click="logout">Logout</UButton>
      </div>
      <UCard>
        <p class="text-sm text-gray-600">Halaman ini khusus untuk ADMIN.</p>
      </UCard>
      <NuxtLink to="/console/gamification">
        <UCard>
          Gamification
        </UCard>
      </NuxtLink>
    </div>
  </div>
</template>
