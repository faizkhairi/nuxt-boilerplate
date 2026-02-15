import nodemailer from "nodemailer";
import type { Transporter, SendMailOptions } from "nodemailer";

// =============================================================================
// SMTP-Agnostic Email Client
// =============================================================================
// Development: Sends to Mailpit (docker compose up) at localhost:1025
// Production:  Sends via any SMTP provider — set SMTP_HOST/PORT/USER/PASS env vars
//
// View dev emails at: http://localhost:8025

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || "localhost";
  const port = parseInt(process.env.SMTP_PORT || "1025", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  transporter = nodemailer.createTransport({
    host,
    port,
    // Use TLS for standard SMTP ports (465, 587), skip for Mailpit (1025)
    secure: port === 465,
    ...(user && pass
      ? { auth: { user, pass } }
      : {}),
  });

  return transporter;
}

// =============================================================================
// Send Email
// =============================================================================

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const from = process.env.SMTP_FROM || "noreply@example.com";

  const mailOptions: SendMailOptions = {
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    ...(options.text ? { text: options.text } : {}),
  };

  await getTransporter().sendMail(mailOptions);
}

// =============================================================================
// Pre-built Email Templates
// =============================================================================

export function welcomeEmail(name: string, appUrl: string): SendEmailOptions {
  return {
    to: "", // caller sets this
    subject: "Welcome!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">Welcome, ${name}!</h1>
        <p style="color: #4a4a4a; line-height: 1.6;">
          Your account has been created successfully. You can now sign in and start using the platform.
        </p>
        <a href="${appUrl}/dashboard"
           style="display: inline-block; padding: 12px 24px; background: #0f172a; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Go to Dashboard
        </a>
      </div>
    `,
    text: `Welcome, ${name}! Your account has been created. Visit ${appUrl}/dashboard to get started.`,
  };
}

export function passwordResetEmail(
  resetUrl: string,
  expiresIn: string = "1 hour"
): SendEmailOptions {
  return {
    to: "", // caller sets this
    subject: "Reset Your Password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">Reset Your Password</h1>
        <p style="color: #4a4a4a; line-height: 1.6;">
          We received a request to reset your password. Click the button below to create a new password.
          This link expires in ${expiresIn}.
        </p>
        <a href="${resetUrl}"
           style="display: inline-block; padding: 12px 24px; background: #0f172a; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Reset Password
        </a>
        <p style="color: #9a9a9a; font-size: 14px; margin-top: 24px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `Reset your password by visiting: ${resetUrl} — This link expires in ${expiresIn}.`,
  };
}

export function verificationEmail(
  verifyUrl: string,
  expiresIn: string = "24 hours"
): SendEmailOptions {
  return {
    to: "", // caller sets this
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">Verify Your Email</h1>
        <p style="color: #4a4a4a; line-height: 1.6;">
          Please verify your email address by clicking the button below.
          This link expires in ${expiresIn}.
        </p>
        <a href="${verifyUrl}"
           style="display: inline-block; padding: 12px 24px; background: #0f172a; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Verify Email
        </a>
        <p style="color: #9a9a9a; font-size: 14px; margin-top: 24px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `Verify your email by visiting: ${verifyUrl} — This link expires in ${expiresIn}.`,
  };
}
