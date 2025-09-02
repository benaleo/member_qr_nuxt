<script setup lang="ts">
definePageMeta({ layout: 'mobile' })
</script>

<template>
  <div class="mx-auto max-w-sm px-4 pt-6 pb-4">
    <div class="grid place-items-center mb-4">
      <div class="w-10 h-10 rounded bg-green-100" />
    </div>

    <div class="text-center">
      <p class="text-pink-600 font-medium">Selamat Datang, Member!</p>
      <h1 class="text-2xl font-extrabold leading-tight">Kumpulkan Poin<br />Anda</h1>
    </div>

    <UCard class="mt-6 shadow-lg">
      <div class="text-center text-gray-600 text-sm">
        Pindai kode QR di kasir untuk mendapatkan stempel setiap kali Anda bertransaksi.
      </div>
    </UCard>

    <div class="mt-6">
      <CameraScanner />
    </div>
  </div>
  <MobileNav />
</template>
