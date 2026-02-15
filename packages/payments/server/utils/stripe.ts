import Stripe from "stripe";
import { prisma } from "@myturborepo/database";

// Initialize Stripe client (lazy-loaded, only if env vars are set)
let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY environment variable to enable payments."
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }

  return stripeClient;
}

/**
 * Create a Stripe Checkout Session for a one-time payment
 */
export async function createCheckoutSession(params: {
  userId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const stripe = getStripeClient();

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { email: true },
  });

  if (!user?.email) {
    throw new Error("User not found");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      userId: params.userId,
      ...params.metadata,
    },
  });

  return session;
}

/**
 * Create a Stripe Checkout Session for a subscription
 */
export async function createSubscriptionSession(params: {
  userId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const stripe = getStripeClient();

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { email: true },
  });

  if (!user?.email) {
    throw new Error("User not found");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      userId: params.userId,
      ...params.metadata,
    },
  });

  return session;
}

/**
 * Create a Stripe Customer Portal session for managing subscriptions
 */
export async function createPortalSession(params: {
  customerId: string;
  returnUrl: string;
}) {
  const stripe = getStripeClient();

  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });

  return session;
}

/**
 * Get subscription status for a user
 */
export async function getUserSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  return subscription;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  const stripe = getStripeClient();

  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  return subscription;
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error(
      "Stripe webhook secret not configured. Set STRIPE_WEBHOOK_SECRET environment variable."
    );
  }

  const stripe = getStripeClient();

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
    return event;
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
}
