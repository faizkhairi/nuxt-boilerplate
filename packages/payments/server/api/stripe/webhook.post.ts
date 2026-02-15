import { defineEventHandler, readRawBody } from "h3";
import { verifyWebhookSignature } from "../../utils/stripe";
import { prisma } from "@myturborepo/database";
import type Stripe from "stripe";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Check if Stripe is enabled
  if (!config.stripeSecretKey || !config.stripeWebhookSecret) {
    throw createError({
      statusCode: 400,
      message: "Stripe is not configured",
    });
  }

  // Get the raw body and signature
  const body = await readRawBody(event);
  const signature = getHeader(event, "stripe-signature");

  if (!body || !signature) {
    throw createError({
      statusCode: 400,
      message: "Missing webhook body or signature",
    });
  }

  // Verify webhook signature
  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = verifyWebhookSignature(body, signature);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    throw createError({
      statusCode: 400,
      message: "Invalid signature",
    });
  }

  // Handle the event
  try {
    switch (stripeEvent.type) {
      case "checkout.session.completed": {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = stripeEvent.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = stripeEvent.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return { received: true };
  } catch (err: any) {
    console.error(`Error handling webhook event ${stripeEvent.type}:`, err);
    throw createError({
      statusCode: 500,
      message: "Webhook handler failed",
    });
  }
});

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error("No userId in checkout session metadata");
    return;
  }

  // For subscription mode, the subscription will be handled by subscription.created event
  if (session.mode === "subscription") {
    console.log(
      `Checkout session completed for subscription: ${session.subscription}`
    );
    return;
  }

  // For payment mode (one-time payment)
  if (session.mode === "payment") {
    console.log(`One-time payment completed for user ${userId}`);
    // Add your custom logic here (e.g., grant access to a product, update user credits, etc.)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error("No userId in subscription metadata");
    return;
  }

  // Upsert subscription in database
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: subscription.items.data[0]?.price.id || "",
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      status: subscription.status,
      stripePriceId: subscription.items.data[0]?.price.id || "",
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  console.log(`Subscription updated for user ${userId}: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error("No userId in subscription metadata");
    return;
  }

  // Update subscription status to canceled
  await prisma.subscription.update({
    where: { userId },
    data: {
      status: "canceled",
      cancelAtPeriodEnd: false,
    },
  });

  console.log(`Subscription deleted for user ${userId}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    console.log("Invoice not associated with a subscription");
    return;
  }

  console.log(`Invoice payment succeeded for subscription ${subscriptionId}`);
  // Add your custom logic here (e.g., send receipt email)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    console.log("Invoice not associated with a subscription");
    return;
  }

  console.log(`Invoice payment failed for subscription ${subscriptionId}`);
  // Add your custom logic here (e.g., send payment failed email, notify user)
}
