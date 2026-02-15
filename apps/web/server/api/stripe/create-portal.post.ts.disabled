import { defineEventHandler } from "h3";
import { getServerSession } from "#auth";
import {
  createPortalSession,
  getUserSubscription,
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

  const userId = (session.user as any).id;

  try {
    // Get user's subscription to find their Stripe customer ID
    const subscription = await getUserSubscription(userId);

    if (!subscription || !subscription.stripeCustomerId) {
      throw createError({
        statusCode: 400,
        message: "No active subscription found",
      });
    }

    const appUrl = config.public.appUrl;

    const portalSession = await createPortalSession({
      customerId: subscription.stripeCustomerId,
      returnUrl: `${appUrl}/dashboard/subscription`,
    });

    return {
      url: portalSession.url,
    };
  } catch (error: any) {
    console.error("Error creating portal session:", error);
    throw createError({
      statusCode: 500,
      message: error.message || "Failed to create portal session",
    });
  }
});
