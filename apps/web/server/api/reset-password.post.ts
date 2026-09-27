import { defineEventHandler, readBody } from "h3";
import { resetPassword } from "../utils/auth";
import { enforceRateLimit, RateLimitPresets } from "../utils/ratelimit";

export default defineEventHandler(async (event) => {
  // 5 requests per minute per client IP
  enforceRateLimit(event, RateLimitPresets.auth, "reset-password");

  const body = await readBody(event);

  const { email, token, password } = body;

  if (!email || !token || !password) {
    throw createError({
      statusCode: 400,
      message: "Email, token, and new password are required",
    });
  }

  try {
    await resetPassword(email, token, password);
    return {
      success: true,
      message: "Password reset successful. You can now sign in with your new password.",
    };
  } catch (error) {
    throw createError({
      statusCode: 400,
      message: (error instanceof Error ? error.message : null) || "Password reset failed",
    });
  }
});
