import { defineEventHandler, readBody } from "h3";
import { registerUser } from "../utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { email, password, name } = body;

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: "Email and password are required",
    });
  }

  try {
    const user = await registerUser({ email, password, name });
    return {
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
      user,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      message: error.message || "Registration failed",
    });
  }
});
