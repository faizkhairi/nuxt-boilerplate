<script setup lang="ts">
import { ref } from 'vue'
import { signIn } from 'next-auth/react'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    const result = await signIn('credentials', {
      email: email.value,
      password: password.value,
      redirect: false,
    })

    if (result?.error) {
      error.value = 'Invalid email or password'
    } else {
      // Redirect to dashboard on success
      await navigateTo('/dashboard')
    }
  } catch (err: any) {
    error.value = err.message || 'Login failed'
  } finally {
    loading.value = false
  }
}

const handleGitHubLogin = async () => {
  await signIn('github', { callbackUrl: '/dashboard' })
}

const handleGoogleLogin = async () => {
  await signIn('google', { callbackUrl: '/dashboard' })
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Sign in to your account</p>
      </div>

      <UiCard>
        <form @submit.prevent="handleLogin" class="space-y-4">
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
          </div>

          <div v-if="error" class="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {{ error }}
          </div>

          <UiButton type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </UiButton>

          <div class="text-center">
            <NuxtLink to="/auth/forgot-password" class="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Forgot your password?
            </NuxtLink>
          </div>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">Or continue with</span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <UiButton variant="outline" @click="handleGitHubLogin" type="button">
              GitHub
            </UiButton>
            <UiButton variant="outline" @click="handleGoogleLogin" type="button">
              Google
            </UiButton>
          </div>
        </div>

        <div class="mt-6 text-center text-sm">
          <span class="text-gray-600 dark:text-gray-400">Don't have an account?</span>
          <NuxtLink to="/auth/register" class="ml-1 text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Sign up
          </NuxtLink>
        </div>
      </UiCard>
    </div>
  </div>
</template>
