<template>
  <nav class="mobile-nav flex gap-1">
    <NuxtLink :to="{ path: '/home' }" :class="linkClass('/home')">
      <UIcon name="i-heroicons-home-20-solid" class="icon" />
      <span>Beranda</span>
    </NuxtLink>
    <NuxtLink :to="{ path: '/hadiah' }" :class="linkClass('/hadiah')">
      <UIcon name="i-heroicons-gift-20-solid" class="icon" />
      <span>Hadiah</span>
    </NuxtLink>
    <NuxtLink :to="{ path: '/history' }" :class="linkClass('/history')">
      <UIcon name="i-heroicons-clock-20-solid" class="icon" />
      <span>Riwayat</span>
    </NuxtLink>
    <NuxtLink :to="{ path: '/profile' }" :class="linkClass('/profile')">
      <UIcon name="i-heroicons-user-20-solid" class="icon" />
      <span>Profil</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { defineNuxtLink } from 'nuxt/app'

const route = useRoute()

function linkClass(path: string) {
  return {
    active: route.path === path,
  }
}
</script>
