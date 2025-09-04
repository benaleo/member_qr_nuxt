<script setup lang="ts">
import { ref } from 'vue'
import { useCookie } from 'nuxt/app'
import { getGamificationByCode, existsUserInGamification, createLogGamification, type Gamification } from '@/api/gamification-api'
import MobileNav from '~/components/MobileNav.vue';

useHead({
  title: 'Home',
});

definePageMeta({ layout: 'mobile' })

const loading = ref(false)
const lastCode = ref('')
const lastMessage = ref('')
const found = ref<Gamification | null>(null)
const manualCode = ref('')

function formatDateYMD(d = new Date()) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

async function onScanned(code: string) {
  lastCode.value = code
  lastMessage.value = ''
  loading.value = true
  try {
    const trimmed = (code || '').trim()
    if (!trimmed) {
      alert('QR tidak valid')
      return
    }

    const gam = await getGamificationByCode(trimmed)
    if (!gam) {
      alert('Kode tidak dikenal')
      return
    }
    found.value = gam

    const userIdStr = useCookie<string | null>('auth_user_id').value
    const userId = userIdStr ? parseInt(userIdStr, 10) : NaN
    if (!userId || Number.isNaN(userId)) {
      alert('User belum login')
      return
    }

    const today = formatDateYMD()
    const existed = await existsUserInGamification(userId, Number(gam.id), today)
    if (existed) {
      alert('Maaf anda sudah hadir')
      return
    }

    // Not existed yet – create a log entry
    try {
      const log = await createLogGamification(userId, Number(gam.id), today, gam.description, gam.point)
      const pts = (log as any)?.point ?? gam.point
      alert(`Berhasil validasi: ${gam.name} (+${pts} poin)`) 
    } catch (e: any) {
      console.warn('Gagal membuat log gamification:', e?.message)
      // Fallback success alert even if logging fails (optional behavior)
      alert(`Validasi berhasil, namun pencatatan poin gagal: ${gam.name}`)
    }
  } catch (e: any) {
    lastMessage.value = e?.message || 'Terjadi kesalahan.'
    alert(lastMessage.value)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-sm px-4 pt-6 pb-36">
    <div class="grid place-items-center mb-4">
      <div class="w-10 h-10 rounded bg-green-100" />
    </div>

    <div class="text-center">
      <p class="text-pink-600 font-medium">Selamat Datang, Member!</p>
      <h1 class="text-2xl font-extrabold leading-tight">
        Kumpulkan Poin<br />Anda
      </h1>
    </div>

    <UCard class="mt-6 shadow-lg">
      <div class="text-center text-gray-600 text-sm">
        Pindai kode QR di kasir untuk mendapatkan stempel setiap kali Anda
        bertransaksi.
      </div>
    </UCard>

    <div class="mt-6">
      <CameraScanner @scanned="onScanned" />
      <p v-if="lastCode" class="mt-2 text-xs text-gray-500">Kode terakhir: <code>{{ lastCode }}</code></p>
      <p v-if="loading" class="text-xs text-gray-400">Memproses...</p>
    </div>

    <UCard class="mt-4">
      <template #header>
        <div class="font-semibold">Masukkan Kode Manual</div>
      </template>
      <div class="grid gap-3">
        <UInput
          v-model="manualCode"
          placeholder="Tulis kode di sini"
          :disabled="loading"
          @keyup.enter="manualCode && onScanned(manualCode.trim())"
        />
        <UButton
          color="primary"
          :loading="loading"
          :disabled="!manualCode.trim() || loading"
          icon="i-heroicons-check"
          @click="onScanned(manualCode.trim())"
        >
          Validasi Kode
        </UButton>
      </div>
    </UCard>
  </div>
</template>
