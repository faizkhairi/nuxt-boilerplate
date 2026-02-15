<script setup lang="ts">
import { ref, onMounted } from 'vue'

const route = useRoute()
const email = ref(route.query.email as string || '')
const token = ref(route.query.token as string || '')
const error = ref('')
const success = ref(false)
const loading = ref(true)

onMounted(async () => {
  // Validate that we have the required query params
  if (!email.value || !token.value) {
    error.value = 'Invalid verification link. Please check your email for the correct link.'
    loading.value = false
    return
  }

  // Automatically verify on page load
  try {
    await $fetch('/api/verify-email', {
      method: 'POST',
      body: {
        email: email.value,
        token: token.value,
      },
    })

    success.value = true
  } catch (err: any) {
    error.value = err.data?.message || 'Email verification failed. The link may have expired.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Email Verification</h1>
      </div>

      <UiCard>
        <div v-if="loading" class="flex flex-col items-center justify-center space-y-4 py-8">
          <div class="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400"></div>
          <p class="text-gray-600 dark:text-gray-400">Verifying your email...</p>
        </div>

        <div v-else-if="success" class="space-y-4">
          <div class="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
            <h3 class="mb-2 text-lg font-semibold text-green-800 dark:text-green-400">
              Email verified successfully!
            </h3>
            <p class="text-sm text-green-800 dark:text-green-400">
              Your account has been verified. You can now sign in.
            </p>
          </div>
          <UiButton @click="navigateTo('/auth/login')" class="w-full">
            Go to login
          </UiButton>
        </div>

        <div v-else class="space-y-4">
          <div class="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <h3 class="mb-2 text-lg font-semibold text-red-800 dark:text-red-400">
              Verification failed
            </h3>
            <p class="text-sm text-red-800 dark:text-red-400">
              {{ error }}
            </p>
          </div>
          <div class="space-y-2">
            <UiButton @click="navigateTo('/auth/register')" variant="outline" class="w-full">
              Register again
            </UiButton>
            <UiButton @click="navigateTo('/auth/login')" variant="ghost" class="w-full">
              Back to login
            </UiButton>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>
