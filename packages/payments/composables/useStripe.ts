import { ref } from "vue";

export function useStripe() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Create a Stripe Checkout session and redirect to Stripe
   */
  const createCheckout = async (params: {
    priceId: string;
    mode?: "subscription" | "payment";
    metadata?: Record<string, string>;
  }) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch("/api/stripe/create-checkout", {
        method: "POST",
        body: {
          priceId: params.priceId,
          mode: params.mode || "subscription",
          metadata: params.metadata,
        },
      });

      // Redirect to Stripe Checkout
      if (response.url) {
        window.location.href = response.url;
      }

      return response;
    } catch (err: any) {
      error.value = err.data?.message || "Failed to create checkout session";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Open Stripe Customer Portal for managing subscriptions
   */
  const openPortal = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch("/api/stripe/create-portal", {
        method: "POST",
      });

      // Redirect to Stripe Portal
      if (response.url) {
        window.location.href = response.url;
      }

      return response;
    } catch (err: any) {
      error.value = err.data?.message || "Failed to open customer portal";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get current user's subscription status
   */
  const getSubscription = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch("/api/subscription");
      return response;
    } catch (err: any) {
      error.value = err.data?.message || "Failed to fetch subscription";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    createCheckout,
    openPortal,
    getSubscription,
  };
}
