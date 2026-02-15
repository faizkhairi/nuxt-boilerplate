import { defineEventHandler, readBody } from "h3";
import { getServerSession } from "#auth";
import {
  createCheckoutSession,
  createSubscriptionSession,
} from "@myturborepo/payments/server/utils/stripe";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Check if Stripe is enabled
  if (!config.stripeSecretKey) {
    throw createError({
      statusCode: 400,
      message: "Stripe is not configured. Set STRIPE_SECRET_KEY to enable payments.",
    });
  }

  // Get authenticated user
  const session = await getServerSession(event);

  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  const body = await readBody(event);
  const { priceId, mode = "subscription", metadata } = body;

  if (!priceId) {
    throw createError({
      statusCode: 400,
      message: "priceId is required",
    });
  }

  const appUrl = config.public.appUrl;

  try {
    const userId = (session.user as any).id;

    let checkoutSession;

    if (mode === "subscription") {
      checkoutSession = await createSubscriptionSession({
        userId,
        priceId,
        successUrl: `${appUrl}/dashboard/subscription?success=true`,
        cancelUrl: `${appUrl}/dashboard/subscription?canceled=true`,
        metadata,
      });
    } else if (mode === "payment") {
      checkoutSession = await createCheckoutSession({
        userId,
        priceId,
        successUrl: `${appUrl}/dashboard?payment=success`,
        cancelUrl: `${appUrl}/dashboard?payment=canceled`,
        metadata,
      });
    } else {
      throw createError({
        statusCode: 400,
        message: "Invalid mode. Must be 'subscription' or 'payment'",
      });
    }

    return {
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    };
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    throw createError({
      statusCode: 500,
      message: error.message || "Failed to create checkout session",
    });
  }
});
