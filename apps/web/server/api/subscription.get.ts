import { defineEventHandler } from "h3";
import { getServerSession } from "#auth";
import { getUserSubscription } from "@myturborepo/payments/server/utils/stripe";

export default defineEventHandler(async (event) => {
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
    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      return {
        hasSubscription: false,
        subscription: null,
      };
    }

    // Check if subscription is active
    const isActive =
      subscription.status === "active" || subscription.status === "trialing";

    return {
      hasSubscription: true,
      isActive,
      subscription: {
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      },
    };
  } catch (error: any) {
    console.error("Error fetching subscription:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to fetch subscription",
    });
  }
});
