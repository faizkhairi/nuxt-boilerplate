<script setup lang="ts">
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref(false)
const loading = ref(false)

const handleRegister = async () => {
  error.value = ''
  loading.value = true

  // Validate passwords match
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    loading.value = false
    return
  }

  // Validate password strength (minimum 8 characters)
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters long'
    loading.value = false
    return
  }

  try {
    const response = await $fetch('/api/register', {
      method: 'POST',
      body: {
        name: name.value,
        email: email.value,
        password: password.value,
      },
    })

    success.value = true
  } catch (err: any) {
    error.value = err.data?.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Create an account</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Get started for free</p>
      </div>

      <UiCard>
        <div v-if="success" class="space-y-4">
          <div class="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
            <p class="text-sm text-green-800 dark:text-green-400">
              Account created successfully! Please check your email to verify your account.
            </p>
          </div>
          <UiButton @click="navigateTo('/auth/login')" class="w-full">
            Go to login
          </UiButton>
        </div>

        <form v-else @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <UiInput
              id="name"
              v-model="name"
              type="text"
              placeholder="John Doe"
              required
              class="mt-1"
            />
          </div>

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

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <UiInput
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
              class="mt-1"
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
            />
          </div>

          <div v-if="error" class="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {{ error }}
          </div>

          <UiButton type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Creating account...' : 'Create account' }}
          </UiButton>

          <div class="mt-6 text-center text-sm">
            <span class="text-gray-600 dark:text-gray-400">Already have an account?</span>
            <NuxtLink to="/auth/login" class="ml-1 text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Sign in
            </NuxtLink>
          </div>
        </form>
      </UiCard>
    </div>
  </div>
</template>
