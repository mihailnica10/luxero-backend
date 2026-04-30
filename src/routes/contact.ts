import { render } from "@react-email/render";
import { Hono } from "hono";
import { sendEmail } from "../email/client";
import { ContactNotificationEmail } from "../email/templates/contact-notification";
import { ErrorCodes } from "../lib/error-codes";
import { error, success } from "../lib/response";

const app = new Hono();

// POST /api/contact
app.post("/", async (c) => {
  try {
    const { name, email, subject, message } = await c.req.json();

    if (!name || !email || !subject || !message) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "All fields are required", 400);
    }

    const submittedAt = new Date().toLocaleString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    const emailHtml = await render(
      ContactNotificationEmail({ name, email, subject, message, submittedAt })
    );

    await sendEmail({
      to: "support@luxero.win",
      subject: `Contact Form: ${subject} (from ${name})`,
      html: emailHtml,
      replyTo: email,
    });

    return success(c, { message: "Message sent successfully" });
  } catch (err) {
    console.error("Contact error:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Failed to send message", 500);
  }
});

export default app;
