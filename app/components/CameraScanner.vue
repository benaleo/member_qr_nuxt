<template>
  <div class="w-full">
    <div class="relative rounded-2xl overflow-hidden bg-gray-300 aspect-square grid place-items-center">
      <video
        ref="video"
        class="w-full h-full object-cover"
        autoplay
        playsinline
        muted
        v-show="isStreaming"
      />
      <div v-show="!isStreaming" class="text-gray-600">
        <UIcon name="i-heroicons-qr-code" class="text-5xl mb-2" />
        <p class="text-center text-sm">Kamera belum aktif</p>
      </div>
      <canvas ref="canvas" class="hidden"></canvas>
    </div>

    <div class="mt-4 grid gap-2">
      <UButton :loading="busy" color="primary" size="lg" block icon="i-heroicons-camera" @click="toggleCamera">
        {{ isStreaming ? 'Hentikan Pemindaian' : 'Pindai Kode QR' }}
      </UButton>
      <p v-if="message" class="text-center text-xs text-gray-500">{{ message }}</p>
      <UAlert
        v-if="result"
        color="primary"
        variant="soft"
        class="text-center"
        title="Hasil Pemindaian"
        :description="result"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const video = ref<HTMLVideoElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const stream = ref<MediaStream | null>(null)
const isStreaming = ref(false)
const busy = ref(false)
const message = ref<string>('')
const result = ref<string>('')
let rafId: number | null = null

let detector: any = null as any

async function ensureDetector() {
  // Use built-in BarcodeDetector if available
  // Fallback: simple no-op detector
  // @ts-ignore
  if ('BarcodeDetector' in window) {
    // @ts-ignore
    detector = new window.BarcodeDetector({ formats: ['qr_code'] })
  } else {
    detector = null
  }
}

async function startCamera() {
  busy.value = true
  try {
    await ensureDetector()
    stream.value = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    if (video.value && stream.value) {
      video.value.srcObject = stream.value
      await video.value.play()
      isStreaming.value = true
      message.value = detector ? 'Memindai QR...' : 'Pemindaian dasar (tanpa deteksi QR)'
      tick()
    }
  } catch (e: any) {
    message.value = e?.message || 'Tidak dapat mengakses kamera.'
  } finally {
    busy.value = false
  }
}

function stopCamera() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = null
  if (stream.value) {
    stream.value.getTracks().forEach(t => t.stop())
    stream.value = null
  }
  isStreaming.value = false
}

function toggleCamera() {
  if (isStreaming.value) stopCamera()
  else startCamera()
}

async function tick() {
  if (!video.value || !isStreaming.value) return

  if (detector && canvas.value) {
    const ctx = canvas.value.getContext('2d')
    if (ctx) {
      canvas.value.width = video.value.videoWidth
      canvas.value.height = video.value.videoHeight
      ctx.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height)
      try {
        const bitmap = await createImageBitmap(canvas.value)
        const codes = await detector.detect(bitmap)
        if (codes?.length) {
          result.value = codes[0].rawValue || ''
          message.value = 'QR terdeteksi'
          stopCamera()
          return
        }
      } catch (_e) {
        // ignore per-frame errors
      }
    }
  }

  rafId = requestAnimationFrame(tick)
}

onBeforeUnmount(() => stopCamera())

onMounted(() => {
  message.value = 'Siap memindai. Aktifkan kamera untuk mulai.'
})
</script>
