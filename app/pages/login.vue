<script setup lang="ts">
import { reactive, ref } from 'vue'
import { loginApi } from '@/api/auth-api'
import type { LoginInput } from '@/api/auth-api'
import { navigateTo, useCookie } from 'nuxt/app'

const form = reactive<LoginInput>({ username: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function onSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!form.username || !form.password) {
    errorMessage.value = 'Harap isi username dan password.'
    return
  }

  try {
    loading.value = true
    const res = await loginApi({ ...form })

    // Store token and roles for subsequent requests
    const tokenCookie = useCookie('auth_token', { sameSite: 'lax' })
    tokenCookie.value = res.token
    // Support both shapes: user.roles (Role[]) or user.role (Role | string)
    const rolesField: any = (res.user as any).roles ?? (res.user as any).role ?? []
    let roleNames: string[] = []
    if (typeof rolesField === 'string') roleNames = [rolesField]
    else if (Array.isArray(rolesField)) roleNames = rolesField.map((r: any) => r?.name ?? r).filter(Boolean)
    else if (rolesField && typeof rolesField === 'object') roleNames = [rolesField.name].filter(Boolean)
    roleNames = roleNames.map((n: string) => String(n).toUpperCase())
    const rolesCookie = useCookie('auth_roles', { sameSite: 'lax' })
    rolesCookie.value = JSON.stringify(roleNames)
    const roleCookie = useCookie('auth_role', { sameSite: 'lax' })
    roleCookie.value = roleNames[0] || ''

    successMessage.value = `Halo, ${res.user.name}!`

    // Redirect based on role
    const isAdmin = roleNames.some((up: string) => up === 'ADMIN' || up === 'SUPERADMIN')
    const target = isAdmin ? '/console' : '/home'
    await new Promise(r => setTimeout(r, 500))
    await navigateTo(target)
  } catch (err: any) {
    errorMessage.value = err?.message || 'Login gagal.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    <div class="w-full max-w-sm space-y-6">
      <h1 class="text-center text-2xl font-semibold">Masuk</h1>

      <UForm :state="form" @submit="onSubmit">
        <div class="space-y-4">
          <UFormGroup label="Username" name="username">
            <UInput v-model="form.username" placeholder="Username" autocomplete="username" size="lg" />
          </UFormGroup>

          <UFormGroup label="Password" name="password">
            <UInput
              :type="showPassword ? 'text' : 'password'"
              v-model="form.password"
              placeholder="Password"
              autocomplete="current-password"
              size="lg"
              :ui="{ trailing: 'pointer-events-none' }"
            >
              <template #trailing>
                <UButton
                  color="primary"
                  variant="ghost"
                  :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                  @click="showPassword = !showPassword"
                  aria-label="Toggle password visibility"
                />
              </template>
            </UInput>
          </UFormGroup>

          <UButton type="submit" color="secondary" size="lg" block :loading="loading">
            Masuk
          </UButton>
        </div>
      </UForm>

      <div v-if="errorMessage" class="text-red-600 text-sm text-center">{{ errorMessage }}</div>
      <div v-if="successMessage" class="text-green-600 text-sm text-center">{{ successMessage }}</div>
    </div>
  </div>
</template>
