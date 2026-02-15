<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const error = ref('')
const success = ref(false)
const loading = ref(false)

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    await $fetch('/api/forgot-password', {
      method: 'POST',
      body: { email: email.value },
    })

    success.value = true
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to send reset email. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Reset your password</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <UiCard>
        <div v-if="success" class="space-y-4">
          <div class="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
            <p class="text-sm text-green-800 dark:text-green-400">
              If an account with that email exists, we've sent a password reset link. Please check your email.
            </p>
          </div>
          <UiButton @click="navigateTo('/auth/login')" variant="outline" class="w-full">
            Back to login
          </UiButton>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <UiInput
              id="email"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              required
              class="mt-1"
            />
          </div>

          <div v-if="error" class="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {{ error }}
          </div>

          <UiButton type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Sending...' : 'Send reset link' }}
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
