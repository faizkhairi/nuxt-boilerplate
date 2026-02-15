import { defineEventHandler, readBody } from "h3";
import { requestPasswordReset } from "../utils/auth";

export default defineEventHandler(async (event) => {
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
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      message: error.message || "Password reset request failed",
    });
  }
});
