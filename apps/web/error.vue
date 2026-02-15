<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="max-w-md w-full text-center space-y-6">
      <div class="space-y-2">
        <h1 class="text-6xl font-bold text-foreground">
          {{ error.statusCode || 500 }}
        </h1>
        <h2 class="text-2xl font-semibold text-foreground">
          {{ errorTitle }}
        </h2>
        <p class="text-muted-foreground">
          {{ errorMessage }}
        </p>
      </div>

      <div v-if="isDev" class="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg text-left">
        <p class="text-sm font-mono text-destructive break-all">
          {{ error.message }}
        </p>
        <pre v-if="error.stack" class="mt-2 text-xs text-destructive/80 overflow-auto max-h-40">{{ error.stack }}</pre>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <UiButton @click="handleClearError">
          Try Again
        </UiButton>
        <UiButton variant="outline" @click="goHome">
          Go Home
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const isDev = process.dev

const errorTitle = computed(() => {
  const statusCode = props.error.statusCode || 500

  const titles: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Page Not Found',
    500: 'Server Error',
    503: 'Service Unavailable',
  }

  return titles[statusCode] || 'An Error Occurred'
})

const errorMessage = computed(() => {
  const statusCode = props.error.statusCode || 500

  const messages: Record<number, string> = {
    400: 'The request could not be understood by the server.',
    401: 'You need to be authenticated to access this page.',
    403: 'You don\'t have permission to access this resource.',
    404: 'The page you\'re looking for doesn\'t exist.',
    500: 'Something went wrong on our end. We\'re working on it.',
    503: 'The service is temporarily unavailable. Please try again later.',
  }

  return messages[statusCode] || props.error.message || 'An unexpected error occurred.'
})

const handleClearError = () => clearError({ redirect: '/' })
const goHome = () => navigateTo('/')
</script>
