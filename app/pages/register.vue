<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { registerApi } from '~/api/auth-api'
import type { RegisterInput } from '~/api/auth-api'

const form = ref<RegisterInput>({
  name: '',
  username: '',
  email: '',
  password: ''
})

const showPassword = ref(false)
const loading = ref(false)

async function onSubmit() {
  if (!form.value.name || !form.value.username || !form.value.password) {
    toast.error('Mohon lengkapi semua field yang wajib diisi')
    return
  }

  if (form.value.password.length < 8) {
    toast.error('Password minimal 8 karakter')
    return
  }

  loading.value = true
  try {
    await registerApi(form.value)
    toast.success('Pendaftaran berhasil! Silakan masuk')
    await navigateTo('/login')
  } catch (error: any) {
    toast.error(error?.message || 'Gagal mendaftar. Silakan coba lagi.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50 text-slate-700">
    <div class="w-full max-w-md space-y-6 bg-white p-8 rounded-xl shadow-md">
      <h1 class="text-2xl font-bold text-center">Daftar Akun Baru</h1>

      <UForm :state="form" @submit="onSubmit" class="space-y-4">
        <UFormField label="Nama Lengkap" name="name" required>
          <UInput
            v-model="form.name"
            placeholder="Masukkan nama lengkap"
            class="form-input"
          />
        </UFormField>

        <UFormField label="Username" name="username" required>
          <UInput
            v-model="form.username"
            placeholder="Pilih username"
            class="form-input"
          />
        </UFormField>

        <UFormField label="Email (Opsional)" name="email">
          <UInput
            v-model="form.email"
            type="email"
            placeholder="email@contoh.com"
            class="form-input"
          />
        </UFormField>

        <UFormField label="Password" name="password" required>
          <UInput
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Buat password"
            class="form-input"
            :ui="{ trailing: 'pointer-events-none' }"
          >
            <template #trailing>
              <UButton
                color="secondary"
                variant="link"
                :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                :padded="false"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
          <p class="text-xs text-gray-500 mt-1">
            Minimal 8 karakter
          </p>
        </UFormField>

        <UButton
          type="submit"
          color="secondary"
          :loading="loading"
          block
          class="mt-6"
        >
          Daftar
        </UButton>

        <p class="text-sm text-center text-gray-600">
          Sudah punya akun?
          <NuxtLink to="/login" class="text-primary hover:underline">Masuk di sini</NuxtLink>
        </p>
      </UForm>
    </div>
  </div>
</template>