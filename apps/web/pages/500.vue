<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="max-w-md w-full text-center space-y-6">
      <div class="space-y-2">
        <h1 class="text-8xl font-bold text-foreground">500</h1>
        <h2 class="text-3xl font-semibold text-foreground">Server Error</h2>
        <p class="text-muted-foreground">
          Something went wrong on our end. Our team has been notified and is working on a fix.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <UiButton @click="reloadPage">
          Refresh Page
        </UiButton>
        <UiButton variant="outline" @click="navigateTo('/')">
          Go Home
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const reloadPage = () => {
  if (process.client) {
    window.location.reload()
  }
}
</script>
