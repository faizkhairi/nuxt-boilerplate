import { defineEventHandler, readBody } from "h3";
import { resetPassword } from "../utils/auth";

export default defineEventHandler(async (event) => {
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
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      message: error.message || "Password reset failed",
    });
  }
});
