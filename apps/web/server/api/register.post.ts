import { defineEventHandler, readBody } from "h3";
import { registerUser } from "../utils/auth";
import { logError } from "../utils/logger";
import { enforceRateLimit, RateLimitPresets } from "../utils/ratelimit";

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
  // 5 requests per minute per client IP
  enforceRateLimit(event, RateLimitPresets.auth, "register");

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
  } catch (error) {
    // Only the duplicate-account message is safe to show; anything else
    // (database or driver errors) stays in the server log.
    if (error instanceof Error && error.message === "User already exists") {
      throw createError({ statusCode: 409, message: error.message });
    }
    logError(error instanceof Error ? error : new Error(String(error)), { context: "register" });
    throw createError({ statusCode: 400, message: "Registration failed" });
  }
});
