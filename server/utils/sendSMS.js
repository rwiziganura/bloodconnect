import africastalkingImport from "africastalking";

const raw = africastalkingImport?.default ?? africastalkingImport;
const initSdk = typeof raw === "function" ? raw : null;

/**
 * Send SMS via Africa's Talking. No-ops when credentials are missing.
 * @returns {{ ok: boolean, skipped?: boolean, error?: string, response?: unknown }}
 */
export async function sendSMS(toPhone, message) {
  const username = process.env.AFRICASTALKING_USERNAME?.trim();
  const apiKey = process.env.AFRICASTALKING_API_KEY?.trim();

  if (!username || !apiKey) {
    console.warn("sendSMS: Africa's Talking credentials not set; skipping SMS.");
    return { ok: true, skipped: true };
  }

  if (!initSdk) {
    console.warn("sendSMS: Africa's Talking SDK could not be loaded; skipping SMS.");
    return { ok: true, skipped: true };
  }

  const normalized = String(toPhone || "").replace(/\s/g, "");
  if (!normalized) {
    return { ok: false, error: "No phone number" };
  }

  let phone = normalized;
  if (!phone.startsWith("+")) {
    phone = phone.replace(/^0+/, "");
    if (!phone.startsWith("+")) phone = `+${phone}`;
  }

  try {
    const AT = initSdk({ apiKey, username });
    const sms = AT.SMS;
    const senderId = process.env.AFRICASTALKING_SENDER_ID?.trim() || undefined;
    const options = {
      to: [phone],
      message: message.slice(0, 480),
    };
    if (senderId) options.from = senderId;

    const result = await sms.send(options);
    return { ok: true, response: result };
  } catch (err) {
    console.error("sendSMS failed:", err.message || err);
    return { ok: false, error: err.message || String(err) };
  }
}
