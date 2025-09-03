<script setup lang="ts">
// Gamification page
import { onMounted, ref } from "vue";
import { navigateTo } from "nuxt/app";
import {
  getGamifications,
  createGamification,
  type Gamification,
} from "@/api/gamification-api";

const loading = ref(false);
const error = ref("");
const list = ref<Gamification[]>([]);
// Map of code -> image src (dataURL or remote URL)
const qrSrcMap = ref<Record<string, string>>({});

// Create modal state
const showCreate = ref(false);
const form = ref({ name: "", description: "", point: 0, code: "" });
const creating = ref(false);
const confirmDeleteId = ref<number | null>(null);

function qrUrl(code?: string) {
  if (!code) return "";
  // Generate QR via public API (no dependency). Size 200x200.
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    code
  )}`;
}

function cacheKey(code: string) {
  return `qr_img:${code}`;
}

function loadFromCache(code: string): string | null {
  try {
    return localStorage.getItem(cacheKey(code));
  } catch {
    return null;
  }
}

async function fetchAndCacheQr(code: string) {
  const url = qrUrl(code);
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) throw new Error("Gagal mengambil QR");
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    try {
      localStorage.setItem(cacheKey(code), dataUrl);
    } catch {
      // ignore quota errors
    }
    qrSrcMap.value[code] = dataUrl;
  } catch {
    // On failure, fall back to remote URL
    qrSrcMap.value[code] = url;
  }
}

async function ensureQrForList(items: Gamification[]) {
  const codes = items.map((i) => i.code).filter((c): c is string => !!c);
  for (const code of codes) {
    const cached = loadFromCache(code);
    if (cached) {
      qrSrcMap.value[code] = cached;
    } else {
      // optimistic show remote url while fetching and caching
      qrSrcMap.value[code] = qrUrl(code);
      fetchAndCacheQr(code);
    }
  }
}

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const res = await getGamifications();
    list.value = res.items || [];
    await ensureQrForList(list.value);
  } catch (e: any) {
    error.value = e?.message || "Gagal memuat data.";
  } finally {
    loading.value = false;
  }
}

onMounted(load);

async function submitCreate() {
  if (
    !form.value.name?.trim() ||
    !form.value.code?.trim() ||
    !Number.isFinite(form.value.point)
  ) {
    alert("Lengkapi form (name, code, point)");
    return;
  }
  creating.value = true;
  try {
    await createGamification(
      form.value.name.trim(),
      Number(form.value.point),
      form.value.code.trim(),
      form.value.description?.trim() || undefined
    );
    showCreate.value = false;
    form.value = { name: "", description: "", point: 0, code: "" };
    await load();
  } catch (e: any) {
    alert(e?.message || "Gagal membuat gamification");
  } finally {
    creating.value = false;
  }
}

function openDelete(id: number) {
  confirmDeleteId.value = id;
}

async function confirmDelete() {
  if (!confirmDeleteId.value) return;
  // TODO: Implement delete API when schema is available. For now, just notify.
  window.alert(
    "Delete belum diimplementasikan. Mohon sediakan schema mutation deleteGamification."
  );
  confirmDeleteId.value = null;
}

function notifyEdit() {
  window.alert("Edit belum diimplementasikan");
}
</script>

<template>
  <div class="min-h-screen p-6">
    <div class="mx-auto max-w-3xl space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Gamification</h1>
        <div class="flex gap-2">
          <UButton
            color="neutral"
            size="lg"
            icon="i-heroicons-arrow-left"
            @click="navigateTo('/console')"
          >
            Back
          </UButton>
        </div>
      </div>
      <UButton
        color="primary"
        size="lg"
        icon="i-heroicons-plus"
        @click="showCreate = true"
        >Tambah</UButton
      >

      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        :title="'Error'"
        :description="error"
      />
      <div v-if="loading" class="text-sm text-gray-500">Memuat...</div>

      <div class="grid gap-4 sm:grid-cols-2">
        <UCard v-for="item in list" :key="item.id" class="overflow-hidden">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="font-semibold">{{ item.name }}</div>
              <div class="text-pink-600 text-sm">+{{ item.point }} poin</div>
            </div>
          </template>
          <div class="grid gap-3 items-center">
            <div class="flex justify-center">
              <div class="bg-white p-4 rounded-xl">
                <img
                  v-if="item.code"
                  :src="qrSrcMap[item.code] || qrUrl(item.code)"
                  alt="QR"
                  class="aspect-square rounded border"
                />
                <div v-else class="text-xs text-gray-400">Tidak ada kode</div>
              </div>
            </div>
            <div class="flex justify-end gap-2 px-4 pb-4">
              <UButton
                size="sm"
                color="neutral"
                variant="soft"
                icon="i-heroicons-pencil-square"
                @click="notifyEdit"
              />
              <UButton
                size="sm"
                color="error"
                variant="soft"
                icon="i-heroicons-trash"
                @click="openDelete(item.id)"
              />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Create Modal (simple overlay) -->
      <div
        v-if="showCreate"
        class="fixed inset-0 z-50 grid place-items-center bg-black/50"
      >
        <div
          class="w-full max-w-md bg-white text-slate-700 rounded-xl shadow-lg overflow-hidden"
        >
          <div class="px-4 py-3 border-b flex items-center justify-between">
            <div class="font-semibold">Tambah Gamification</div>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-x-mark"
              @click="showCreate = false"
            />
          </div>
          <div class="p-4 grid gap-3">
            <UFormGroup label="Name">
              <UInput
                class="form-input"
                v-model="form.name"
                placeholder="Nama"
              />
            </UFormGroup>
            <UFormGroup label="Description">
              <UInput
                class="form-input"
                v-model="form.description"
                placeholder="Deskripsi"
              />
            </UFormGroup>
            <UFormGroup label="Point">
              <UInput
                class="form-input"
                v-model.number="form.point"
                type="number"
                min="0"
                placeholder="Poin"
              />
            </UFormGroup>
            <UFormGroup label="Code">
              <UInput
                class="form-input"
                v-model="form.code"
                placeholder="Kode unik"
              />
            </UFormGroup>
          </div>
          <div class="px-4 py-3 border-t flex justify-end gap-2">
            <UButton color="neutral" variant="soft" @click="showCreate = false"
              >Batal</UButton
            >
            <UButton color="primary" :loading="creating" @click="submitCreate"
              >Simpan</UButton
            >
          </div>
        </div>
      </div>

      <!-- Delete Confirm -->
      <div
        v-if="confirmDeleteId"
        class="fixed inset-0 z-50 grid place-items-center bg-black/50"
      >
        <div
          class="w-full max-w-sm bg-white text-slate-700 rounded-xl shadow-lg overflow-hidden"
        >
          <div class="px-4 py-3 border-b font-semibold">Konfirmasi Hapus</div>
          <div class="p-4 text-sm">
            Apakah Anda yakin ingin menghapus item ini?
          </div>
          <div class="px-4 py-3 border-t flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="soft"
              @click="confirmDeleteId = null"
              >Batal</UButton
            >
            <UButton color="error" @click="confirmDelete">Hapus</UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
