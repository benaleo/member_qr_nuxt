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
    <NuxtLayout>
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
