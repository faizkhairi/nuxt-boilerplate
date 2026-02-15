import { defineEventHandler, readBody } from "h3";
import { verifyEmail } from "../utils/auth";

/**
 * POST /api/verify-email
 *
 * Verify user email address with token
 *
 * @param {Object} body - Request body
 * @param {string} body.email - User email address (required)
 * @param {string} body.token - Verification token from email link (required)
 *
 * @returns {Object} Verification response
 * @returns {boolean} success - Verification success status
 * @returns {string} message - Success message
 *
 * @throws {400} Email and token are required
 * @throws {400} Invalid or expired verification token
 */
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
