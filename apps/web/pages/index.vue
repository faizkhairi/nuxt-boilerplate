<script setup lang="ts">
import { useSession } from 'next-auth/react'

definePageMeta({
  layout: false,
})

const { data: session, status } = useSession()

// Redirect to dashboard if already logged in
watchEffect(() => {
  if (status === 'authenticated') {
    navigateTo('/dashboard')
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <div class="w-full max-w-4xl px-4">
      <div class="text-center">
        <h1 class="mb-4 text-5xl font-bold text-gray-900 dark:text-white">
          Nuxt Boilerplate
        </h1>
        <p class="mb-8 text-xl text-gray-600 dark:text-gray-400">
          Production-ready Nuxt 3 template with auth, database, email & UI components
        </p>

        <div class="mb-12 flex justify-center gap-4">
          <UiButton @click="navigateTo('/auth/register')" size="lg">
            Get Started
          </UiButton>
          <UiButton @click="navigateTo('/auth/login')" variant="outline" size="lg">
            Sign In
          </UiButton>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          <UiCard>
            <UiCardHeader>
              <UiCardTitle class="text-lg">🔐 Auth Ready</UiCardTitle>
            </UiCardHeader>
            <UiCardContent>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Sidebase Nuxt Auth with credentials & OAuth providers
              </p>
            </UiCardContent>
          </UiCard>

          <UiCard>
            <UiCardHeader>
              <UiCardTitle class="text-lg">🎨 UI Components</UiCardTitle>
            </UiCardHeader>
            <UiCardContent>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Shadcn-vue + Tailwind CSS with dark mode support
              </p>
            </UiCardContent>
          </UiCard>

          <UiCard>
            <UiCardHeader>
              <UiCardTitle class="text-lg">📧 Email Built-in</UiCardTitle>
            </UiCardHeader>
            <UiCardContent>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Nodemailer with templates for auth workflows
              </p>
            </UiCardContent>
          </UiCard>
        </div>

        <div class="mt-12 text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Zero external account dependencies • Turborepo monorepo • Prisma + PostgreSQL
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
