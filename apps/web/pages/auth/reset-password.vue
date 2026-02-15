<script setup lang="ts">
import { ref } from 'vue'

const route = useRoute()
const email = ref(route.query.email as string || '')
const token = ref(route.query.token as string || '')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref(false)
const loading = ref(false)

// Validate that we have the required query params
if (!email.value || !token.value) {
  error.value = 'Invalid reset link. Please request a new password reset.'
}

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  // Validate passwords match
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    loading.value = false
    return
  }

  // Validate password strength
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters long'
    loading.value = false
    return
  }

  try {
    await $fetch('/api/reset-password', {
      method: 'POST',
      body: {
        email: email.value,
        token: token.value,
        password: password.value,
      },
    })

    success.value = true
  } catch (err: any) {
    error.value = err.data?.message || 'Password reset failed. The link may have expired.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Set new password</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Enter your new password below
        </p>
      </div>

      <UiCard>
        <div v-if="success" class="space-y-4">
          <div class="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
            <p class="text-sm text-green-800 dark:text-green-400">
              Password reset successful! You can now sign in with your new password.
            </p>
          </div>
          <UiButton @click="navigateTo('/auth/login')" class="w-full">
            Go to login
          </UiButton>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <UiInput
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
              class="mt-1"
              :disabled="!email || !token"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Minimum 8 characters
            </p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <UiInput
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              class="mt-1"
              :disabled="!email || !token"
            />
          </div>

          <div v-if="error" class="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {{ error }}
          </div>

          <UiButton type="submit" class="w-full" :disabled="loading || !email || !token">
            {{ loading ? 'Resetting password...' : 'Reset password' }}
          </UiButton>

          <div class="text-center">
            <NuxtLink to="/auth/login" class="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Back to login
            </NuxtLink>
          </div>
        </form>
      </UiCard>
    </div>
  </div>
</template>
