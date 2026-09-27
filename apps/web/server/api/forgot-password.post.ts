import { defineEventHandler, readBody } from "h3";
import { requestPasswordReset } from "../utils/auth";
import { enforceRateLimit, RateLimitPresets } from "../utils/ratelimit";

export default defineEventHandler(async (event) => {
  // 5 requests per minute per client IP
  enforceRateLimit(event, RateLimitPresets.auth, "forgot-password");

  const body = await readBody(event);

  const { email } = body;

  if (!email) {
    throw createError({
      statusCode: 400,
      message: "Email is required",
    });
  }

  try {
    await requestPasswordReset(email);
    return {
      success: true,
      message: "If an account exists with that email, a password reset link has been sent.",
    };
  } catch (error) {
    throw createError({
      statusCode: 400,
      message: (error instanceof Error ? error.message : null) || "Password reset request failed",
    });
  }
});
