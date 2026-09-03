type NotificationOrder = {
  order_id: string | null;
  payment_id: string | null;
  customer_name: string | null;
  email: string | null;
  phone: string | null;
  amount: number | null;
};

const STATUS_COPY: Record<string, { subject: string; title: string; message: string }> = {
  paid: {
    subject: "Your Verdant order is confirmed 🌿",
    title: "Your order is confirmed",
    message: "Thank you for your purchase. Your payment was successful and we've received your Verdant order.",
  },
  shipped: {
    subject: "Your Verdant order is on the way 🌿",
    title: "Your order is on the way",
    message: "Good news — your Verdant order has been shipped and is now on its way to you.",
  },
  delivered: {
    subject: "Your Verdant order has been delivered 🌿",
    title: "Your order has arrived",
    message: "Your Verdant order has been marked as delivered. We hope your new plant brings some green home.",
  },
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendEmail(order: NotificationOrder, copy: { subject: string; title: string; message: string }) {
  const result = { attempted: false, sent: false, error: "" };
  if (!order.email || !process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return result;

  result.attempted = true;
  const customerName = order.customer_name?.trim() || "there";
  const orderId = order.order_id || "your Verdant order";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: [order.email],
        subject: copy.subject,
        html: `<!doctype html><html><body style="margin:0;background:#f4f5e9;color:#101510;font-family:Arial,sans-serif"><div style="max-width:620px;margin:0 auto;padding:32px 18px"><div style="background:#202d20;color:#f4f5e9;border-radius:28px;padding:34px"><div style="font-size:11px;letter-spacing:.18em;font-weight:700;color:#ddf27a">VERDANT</div><h1 style="font-size:34px;line-height:1.1;margin:18px 0 12px">${escapeHtml(copy.title)}</h1><p style="font-size:16px;line-height:1.65;color:rgba(244,245,233,.72);margin:0">Hi ${escapeHtml(customerName)}, ${escapeHtml(copy.message)}</p></div><div style="padding:24px 8px;font-size:14px;line-height:1.7;color:#444"><strong>Order ID:</strong> ${escapeHtml(orderId)}<br/><strong>Total:</strong> ₹${Number(order.amount || 0).toLocaleString("en-IN")}<br/><strong>Status:</strong> ${copy.title.replace("Your order is ", "").replace("Your order has ", "").replace("Your ", "")}</div></div></body></html>`,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      result.error = detail || "Email provider rejected the message.";
    } else {
      result.sent = true;
    }
  } catch (error) {
    result.error = error instanceof Error ? error.message : "Email delivery failed.";
  }

  return result;
}

export async function sendOrderConfirmationEmail(order: NotificationOrder) {
  return sendEmail(order, STATUS_COPY.paid);
}

export async function sendOrderNotifications(order: NotificationOrder, status: "shipped" | "delivered") {
  const copy = STATUS_COPY[status];
  const customerName = order.customer_name?.trim() || "there";
  const orderId = order.order_id || "your Verdant order";
  const results = {
    email: { attempted: false, sent: false, error: "" },
    whatsapp: { attempted: false, sent: false, error: "" },
  };

  results.email = await sendEmail(order, copy);

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const graphVersion = process.env.WHATSAPP_GRAPH_VERSION;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  const templateLanguage = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US";
  const phone = normalizeWhatsAppPhone(order.phone);

  if (phone && accessToken && phoneNumberId && graphVersion && templateName) {
    results.whatsapp.attempted = true;
    try {
      const response = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "template",
          template: {
            name: templateName,
            language: { code: templateLanguage },
            components: [{ type: "body", parameters: [{ type: "text", text: customerName }, { type: "text", text: orderId }] }],
          },
        }),
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        results.whatsapp.error = detail || "WhatsApp provider rejected the message.";
      } else {
        results.whatsapp.sent = true;
      }
    } catch (error) {
      results.whatsapp.error = error instanceof Error ? error.message : "WhatsApp delivery failed.";
    }
  }

  return results;
}

export function buildWhatsAppUrl(order: Pick<NotificationOrder, "phone" | "customer_name" | "order_id">, status: "shipped" | "delivered") {
  const phone = normalizeWhatsAppPhone(order.phone);
  if (!phone) return null;

  const name = order.customer_name?.trim() || "there";
  const orderId = order.order_id || "your Verdant order";
  const message = status === "shipped"
    ? `Hi ${name}, your Verdant order ${orderId} has been shipped and is on the way. 🌿`
    : `Hi ${name}, your Verdant order ${orderId} has been delivered. Thank you for shopping with Verdant! 🌿`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function normalizeWhatsAppPhone(value: string | null) {
  if (!value) return null;
  let digits = value.replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}
