import { defineEventHandler, readBody } from "h3";
import { registerUser } from "../utils/auth";
import { logAudit } from "../utils/logger";
import { checkRateLimit, RateLimitPresets } from "../utils/ratelimit";

/**
 * POST /api/register
 *
 * Register a new user account
 *
 * @param {Object} body - Request body
 * @param {string} body.email - User email address (required)
 * @param {string} body.password - User password (required)
 * @param {string} body.name - User full name (optional)
 *
 * @returns {Object} Registration response
 * @returns {boolean} success - Registration success status
 * @returns {string} message - Success message
 * @returns {Object} user - Created user object (id, email, name)
 *
 * @throws {400} Email and password are required
 * @throws {400} Email already exists
 * @throws {400} Registration failed
 * @throws {429} Rate limit exceeded
 */
export default defineEventHandler(async (event) => {
  // Apply rate limiting (5 requests per minute)
  if (checkRateLimit(event, RateLimitPresets.auth)) {
    throw createError({
      statusCode: 429,
      message: RateLimitPresets.auth.message,
    });
  }

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
