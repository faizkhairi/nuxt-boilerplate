<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="max-w-md w-full text-center space-y-6">
      <div class="space-y-2">
        <h1 class="text-8xl font-bold text-foreground">404</h1>
        <h2 class="text-3xl font-semibold text-foreground">Page Not Found</h2>
        <p class="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <UiButton @click="navigateTo('/')">
          Go Home
        </UiButton>
        <UiButton variant="outline" @click="navigateTo(-1)">
          Go Back
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})
</script>
