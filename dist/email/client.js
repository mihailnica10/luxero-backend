import { writeFileSync } from "node:fs";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { emailConfig } from "./config";
const DEBUG_FILE = "/tmp/email-debug.log";
function _debugLog(msg) {
    const line = `[${new Date().toISOString()}] ${msg}`;
    console.log(line);
    try {
        writeFileSync(DEBUG_FILE, `${line}\n`, { flag: "a" });
    }
    catch (_e) { }
}
let resendClient = null;
let smtpTransporter = null;
function getResendClient() {
    if (!resendClient) {
        if (!emailConfig.resend.apiKey)
            throw new Error("RESEND_API_KEY is not configured");
        resendClient = new Resend(emailConfig.resend.apiKey);
    }
    return resendClient;
}
function getSmtpTransporter() {
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
function isSmtpEnabled() {
    return process.env.SMTP_ENABLED === "true" || !emailConfig.resend.apiKey;
}
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;
async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export async function sendEmail(options) {
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
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            return { success: false, error: err.message };
        }
    }
    let lastError = null;
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
            if (data?.data?.id)
                return { success: true, messageId: data.data.id };
            if (data?.error) {
                const errMsg = data.error.message || "Resend API error";
                const errCode = data.error.statusCode || 0;
                if (errCode >= 400 && errCode < 500 && errCode !== 429)
                    return { success: false, error: errMsg };
                lastError = new Error(errMsg);
            }
            else {
                lastError = new Error("Unexpected Resend response");
            }
        }
        catch (error) {
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
export async function verifyEmailConnection() {
    if (isSmtpEnabled()) {
        try {
            const transporter = getSmtpTransporter();
            await transporter.verify();
            return true;
        }
        catch {
            return false;
        }
    }
    try {
        const resend = getResendClient();
        const { error } = await resend.domains.list({ limit: 1 });
        return !error;
    }
    catch {
        return false;
    }
}
