<script setup lang="ts">
import { NuxtLayout } from "#components";
import { Toaster } from "vue-sonner";
import "vue-sonner/style.css";
</script>

<template>
  <div>
    <Toaster richColors />
    <!-- Inject PWA manifest, theme-color and icons -->
    <NuxtPwaAssets />
    <!-- Show an install button when install prompt is available -->
    <PwaInstallPrompt />
    <NuxtLayout>
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
