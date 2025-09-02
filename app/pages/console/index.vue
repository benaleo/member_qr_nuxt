<script setup lang="ts">
import { NuxtLink } from '#components';

// Admin console
</script>

<template>
  <div class="min-h-screen p-6">
    <div class="mx-auto max-w-3xl space-y-2">
      <h1 class="text-2xl font-bold mb-4">Admin Console</h1>
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
