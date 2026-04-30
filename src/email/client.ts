import nodemailer from "nodemailer";
import { Resend } from "resend";
import { emailConfig } from "./config";

function _debugLog(msg: string) {
  // In Vercel serverless, /tmp is ephemeral — logs only survive within a single cold-start.
  // Use structured console output so Vercel Log Drains or Datadog can capture them.
  console.log(`[EMAIL] ${new Date().toISOString()} ${msg}`);
}

let resendClient: Resend | null = null;
let smtpTransporter: nodemailer.Transporter | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    if (!emailConfig.resend.apiKey) throw new Error("RESEND_API_KEY is not configured");
    resendClient = new Resend(emailConfig.resend.apiKey);
  }
  return resendClient;
}

function getSmtpTransporter(): nodemailer.Transporter {
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "localhost",
      port: parseInt(process.env.SMTP_PORT || "1025", 10),
      secure: false,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
      ignoreTLS: true,
    });
  }
  return smtpTransporter;
}

function isSmtpEnabled(): boolean {
  // Prefer SMTP when explicitly enabled; otherwise use Resend if API key is set.
  if (process.env.SMTP_ENABLED === "true") return true;
  if (emailConfig.resend.apiKey) return false;
  // Neither SMTP nor Resend configured — default to SMTP so error is discoverable.
  return true;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: { name: string; email: string };
}

const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendEmail(
  options: SendEmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log(`[EMAIL] sendEmail called: to=${String(options.to)}, subject=${options.subject}`);
  const { to, subject, html, text, replyTo, from } = options;

  const fromAddress = from
    ? `${from.name} <${from.email}>`
    : `${emailConfig.from.name} <${emailConfig.from.email}>`;

  if (isSmtpEnabled()) {
    try {
      const transporter = getSmtpTransporter();
      const info = await transporter.sendMail({
        from: fromAddress,
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ""),
        replyTo: replyTo || emailConfig.replyTo,
      });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      return { success: false, error: err.message };
    }
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const resend = getResendClient();
      const data = await resend.emails.send({
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ""),
        replyTo: replyTo || emailConfig.replyTo,
      });

      if (data?.data?.id) return { success: true, messageId: data.data.id };

      if (data?.error) {
        const errMsg = data.error.message || "Resend API error";
        const errCode = data.error.statusCode || 0;
        if (errCode >= 400 && errCode < 500 && errCode !== 429)
          return { success: false, error: errMsg };
        lastError = new Error(errMsg);
      } else {
        lastError = new Error("Unexpected Resend response");
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (err.message.includes("RESEND_API_KEY") || err.message.includes("not configured")) {
        return { success: false, error: err.message };
      }
      lastError = err;
    }

    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY_BASE * 2 ** (attempt - 1));
    }
  }

  return { success: false, error: lastError?.message || "Failed to send email after retries" };
}

export async function verifyEmailConnection(): Promise<boolean> {
  if (isSmtpEnabled()) {
    try {
      const transporter = getSmtpTransporter();
      await transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
  // Resend API key validation — doesn't require a verified domain.
  // We validate by checking the key is non-empty; actual send errors surface in sendEmail.
  return Boolean(emailConfig.resend.apiKey);
}
