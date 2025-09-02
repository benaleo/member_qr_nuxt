<script setup lang="ts">
import { navigateTo, useCookie } from 'nuxt/app'
import MobileNav from '~/components/MobileNav.vue'

const logout = () => {
  const token = useCookie('auth_token')
  const roles = useCookie('auth_roles')
  token.value = null
  roles.value = null
  navigateTo('/login')
}
definePageMeta({ layout: 'mobile' })
</script>

<template>
  <div class="mx-auto max-w-sm px-4 pt-6 pb-4">
    <h1 class="text-xl font-semibold mb-4">Profil</h1>
    <UCard>
      <div class="space-y-2">
        <p class="text-sm text-gray-600">Informasi profil pengguna.</p>
        <div class="flex gap-2">
          <UButton color="secondary" variant="soft" icon="i-heroicons-arrow-right-on-rectangle" @click="logout">Keluar</UButton>
        </div>
      </div>
    </UCard>
  </div>
  <MobileNav />
</template>
