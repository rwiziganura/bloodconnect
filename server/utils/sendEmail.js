import nodemailer from "nodemailer";

/**
 * Send email via Nodemailer. No-ops when SMTP is not configured.
 * @returns {{ ok: boolean, skipped?: boolean, error?: string, messageId?: string }}
 */
export async function sendEmail(toAddress, subject, text, html) {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) {
    console.warn("sendEmail: SMTP not fully configured; skipping email.");
    return { ok: true, skipped: true };
  }

  const port = Number(process.env.SMTP_PORT) || 587;
  const secure =
    process.env.SMTP_SECURE === "true" || String(port) === "465";

  if (!toAddress?.trim()) {
    return { ok: false, error: "No recipient email" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    const from =
      process.env.SMTP_FROM?.trim() || `"BloodConnect" <${user}>`;

    const info = await transporter.sendMail({
      from,
      to: toAddress.trim(),
      subject: subject.slice(0, 200),
      text: text || undefined,
      html: html || undefined,
    });

    return { ok: true, messageId: info.messageId };
  } catch (err) {
    console.error("sendEmail failed:", err.message || err);
    return { ok: false, error: err.message || String(err) };
  }
}
