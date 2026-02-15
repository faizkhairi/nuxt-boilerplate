<script setup lang="ts">
import { useSession, signOut } from 'next-auth/react'

const { data: session, status } = useSession()

// Redirect to login if not authenticated
if (status === 'unauthenticated') {
  await navigateTo('/auth/login')
}

const handleSignOut = async () => {
  await signOut({ callbackUrl: '/auth/login' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <nav class="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ session?.user?.name || session?.user?.email }}
            </span>
            <UiButton @click="handleSignOut" variant="outline" size="sm">
              Sign out
            </UiButton>
          </div>
        </div>
      </div>
    </nav>

    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back!
        </h2>
        <p class="mt-1 text-gray-600 dark:text-gray-400">
          You're successfully logged in to your account.
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <UiCard>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Profile</h3>
          <div class="mt-4 space-y-2">
            <div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Name:</span>
              <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {{ session?.user?.name || 'Not set' }}
              </span>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Email:</span>
              <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {{ session?.user?.email }}
              </span>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Role:</span>
              <UiBadge variant="secondary" class="ml-2">
                {{ (session?.user as any)?.role || 'USER' }}
              </UiBadge>
            </div>
          </div>
        </UiCard>

        <UiCard>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Quick Stats</h3>
          <div class="mt-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Account Status</span>
              <UiBadge variant="default">Active</UiBadge>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Email Verified</span>
              <UiBadge :variant="session?.user?.emailVerified ? 'default' : 'destructive'">
                {{ session?.user?.emailVerified ? 'Yes' : 'No' }}
              </UiBadge>
            </div>
          </div>
        </UiCard>

        <UiCard>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Getting Started</h3>
          <div class="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>Welcome to your dashboard! This is a production-ready Nuxt 3 boilerplate with:</p>
            <ul class="ml-4 list-disc space-y-1">
              <li>Auth with Sidebase Nuxt Auth</li>
              <li>Prisma ORM + PostgreSQL</li>
              <li>Shadcn-vue + Tailwind CSS</li>
              <li>Email with Nodemailer</li>
            </ul>
          </div>
        </UiCard>
      </div>
    </main>
  </div>
</template>
