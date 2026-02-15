<script setup lang="ts">
definePageMeta({
  layout: false,
});
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <UiCard class="w-full max-w-md">
      <UiCardHeader>
        <UiCardTitle>Welcome</UiCardTitle>
        <UiCardDescription>
          Your Nuxt boilerplate is ready. Start building.
        </UiCardDescription>
      </UiCardHeader>
      <UiCardContent class="space-y-4">
        <UiInput placeholder="Email address" type="email" />
        <div class="flex gap-2">
          <UiButton>Get Started</UiButton>
          <UiButton variant="outline">Learn More</UiButton>
        </div>
      </UiCardContent>
      <UiCardFooter>
        <UiBadge variant="secondary">v0.1.0</UiBadge>
      </UiCardFooter>
    </UiCard>
  </div>
</template>
