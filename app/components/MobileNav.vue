<template>
  <nav class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm bg-white/95 backdrop-blur shadow-lg rounded-2xl px-4 py-2 border border-gray-100 flex gap-1">
    <NuxtLink :to="{ path: '/home' }" :class="linkClass('/home')">
      <UIcon name="i-heroicons-home-20-solid" class="text-xl" />
      <span>Beranda</span>
    </NuxtLink>
    <NuxtLink :to="{ path: '/hadiah' }" :class="linkClass('/hadiah')">
      <UIcon name="i-heroicons-gift-20-solid" class="text-xl" />
      <span>Hadiah</span>
    </NuxtLink>
    <NuxtLink :to="{ path: '/history' }" :class="linkClass('/history')">
      <UIcon name="i-heroicons-clock-20-solid" class="text-xl" />
      <span>Riwayat</span>
    </NuxtLink>
    <NuxtLink :to="{ path: '/profile' }" :class="linkClass('/profile')">
      <UIcon name="i-heroicons-user-20-solid" class="text-xl" />
      <span>Profil</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

function linkClass(path: string) {
  const active = route.path === path
  const base = 'flex flex-col items-center justify-center text-xs gap-1 py-2 flex-1'
  const inactive = 'text-gray-500'
  const activeCls = 'text-pink-600 font-medium'
  return `${base} ${active ? activeCls : inactive}`
}
</script>
