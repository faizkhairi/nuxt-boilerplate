<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSession, signOut } from 'next-auth/react'
import { useStripe } from '@myturborepo/payments/composables/useStripe'

const { data: session, status } = useSession()
const { loading, error, createCheckout, openPortal, getSubscription } = useStripe()

// Redirect to login if not authenticated
if (status === 'unauthenticated') {
  await navigateTo('/auth/login')
}

const subscription = ref<any>(null)
const loadingSubscription = ref(true)

// Example pricing tiers - Replace with your actual Stripe Price IDs
const pricingPlans = [
  {
    name: 'Starter',
    price: '$9/month',
    priceId: 'price_starter', // Replace with your Stripe Price ID
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
  },
  {
    name: 'Pro',
    price: '$29/month',
    priceId: 'price_pro', // Replace with your Stripe Price ID
    features: ['All Starter features', 'Feature 4', 'Feature 5', 'Priority support'],
  },
]

const handleSignOut = async () => {
  await signOut({ callbackUrl: '/auth/login' })
}

const handleSubscribe = async (priceId: string) => {
  try {
    await createCheckout({
      priceId,
      mode: 'subscription',
    })
  } catch (err) {
    console.error('Error creating checkout:', err)
  }
}

const handleManageSubscription = async () => {
  try {
    await openPortal()
  } catch (err) {
    console.error('Error opening portal:', err)
  }
}

onMounted(async () => {
  try {
    const data = await getSubscription()
    subscription.value = data
  } catch (err) {
    console.error('Error fetching subscription:', err)
  } finally {
    loadingSubscription.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <nav class="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between">
          <div class="flex items-center space-x-8">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Subscription</h1>
            <NuxtLink to="/dashboard" class="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Dashboard
            </NuxtLink>
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
      <!-- Current Subscription Status -->
      <div v-if="!loadingSubscription" class="mb-8">
        <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Current Subscription
        </h2>

        <UiCard v-if="subscription?.hasSubscription">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ subscription.isActive ? 'Active Subscription' : 'Inactive Subscription' }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Status: <UiBadge :variant="subscription.isActive ? 'default' : 'secondary'">
                    {{ subscription.subscription.status }}
                  </UiBadge>
                </p>
              </div>
              <UiButton @click="handleManageSubscription" :disabled="loading">
                {{ loading ? 'Loading...' : 'Manage Subscription' }}
              </UiButton>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Current Period End:</span>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString() }}
                </p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-renew:</span>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ subscription.subscription.cancelAtPeriodEnd ? 'Canceled (ends on period end)' : 'Active' }}
                </p>
              </div>
            </div>

            <div v-if="error" class="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {{ error }}
            </div>
          </div>
        </UiCard>

        <UiCard v-else>
          <p class="text-gray-600 dark:text-gray-400">
            You don't have an active subscription. Choose a plan below to get started.
          </p>
        </UiCard>
      </div>

      <!-- Pricing Plans (only show if no active subscription) -->
      <div v-if="!loadingSubscription && !subscription?.isActive">
        <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Choose a Plan
        </h2>

        <div class="grid gap-6 md:grid-cols-2">
          <UiCard v-for="plan in pricingPlans" :key="plan.priceId">
            <div class="space-y-4">
              <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ plan.name }}</h3>
                <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ plan.price }}</p>
              </div>

              <ul class="space-y-2">
                <li v-for="feature in plan.features" :key="feature" class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <svg class="mr-2 h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ feature }}
                </li>
              </ul>

              <UiButton @click="handleSubscribe(plan.priceId)" :disabled="loading" class="w-full">
                {{ loading ? 'Loading...' : 'Subscribe' }}
              </UiButton>
            </div>
          </UiCard>
        </div>

        <div class="mt-8 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
          <p class="text-sm text-blue-800 dark:text-blue-400">
            💡 <strong>Note:</strong> This is a demo subscription page. To enable Stripe payments:
          </p>
          <ol class="mt-2 ml-4 list-decimal text-sm text-blue-800 dark:text-blue-400">
            <li>Set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env</li>
            <li>Replace the priceId values above with your actual Stripe Price IDs</li>
            <li>Configure webhook at https://dashboard.stripe.com/webhooks to point to /api/stripe/webhook</li>
          </ol>
        </div>
      </div>

      <div v-if="error && !loading" class="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
        {{ error }}
      </div>
    </main>
  </div>
</template>
