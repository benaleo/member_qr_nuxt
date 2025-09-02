<script setup lang="ts">
// Landing page for unauthenticated users
</script>

<template>
  <div class="min-h-screen grid place-items-center p-6 bg-gray-50">
    <UCard class="w-full max-w-sm text-center">
      <div class="space-y-3">
        <h1 class="text-2xl font-bold">Selamat Datang</h1>
        <p class="text-gray-600 text-sm">Silakan masuk untuk mulai mengumpulkan poin.</p>
        <div class="pt-2">
          <UButton size="lg" color="primary" to="/login">Masuk</UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>
