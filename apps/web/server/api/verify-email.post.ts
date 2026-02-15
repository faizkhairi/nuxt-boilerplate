import { defineEventHandler, readBody } from "h3";
import { verifyEmail } from "../utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { email, token } = body;

  if (!email || !token) {
    throw createError({
      statusCode: 400,
      message: "Email and token are required",
    });
  }

  try {
    await verifyEmail(email, token);
    return {
      success: true,
      message: "Email verified successfully. You can now sign in.",
    };
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      message: error.message || "Verification failed",
    });
  }
});
