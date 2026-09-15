import crypto from "node:crypto";
import { supabaseInsert, supabaseRest, supabaseSelect, supabaseUpdate } from "@/lib/supabase-admin";

const RESET_MINUTES = 30;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

function expiresAt() {
  const date = new Date();
  date.setMinutes(date.getMinutes() + RESET_MINUTES);
  return date.toISOString();
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function requestPasswordReset(email: string) {
  const customerResult = await supabaseSelect(
    "customers",
    `select=id,name,email&email=eq.${encodeURIComponent(email.toLowerCase())}&limit=1`,
  );

  if (!customerResult.response?.ok || !Array.isArray(customerResult.data) || !customerResult.data[0]) {
    return { ok: true };
  }

  const customer = customerResult.data[0] as { id: string; name: string; email: string };

  await supabaseRest(`/rest/v1/password_reset_tokens?customer_id=eq.${encodeURIComponent(customer.id)}`, {
    method: "DELETE",
  });

  const token = crypto.randomBytes(32).toString("base64url");
  const tokenResult = await supabaseInsert("password_reset_tokens", {
    customer_id: customer.id,
    token_hash: hashToken(token),
    expires_at: expiresAt(),
  });

  if (!tokenResult.response?.ok) {
    return { ok: false, error: "Unable to prepare the password reset email." };
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return { ok: false, error: "Password reset email is not configured yet." };
  }

  const resetUrl = `${siteUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  const customerName = customer.name?.trim() || "there";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: [customer.email],
        subject: "Reset your Verdant password",
        html: `<!doctype html><html><body style="margin:0;background:#f4f5e9;color:#101510;font-family:Arial,sans-serif"><div style="max-width:620px;margin:0 auto;padding:32px 18px"><div style="background:#202d20;color:#f4f5e9;border-radius:28px;padding:34px"><div style="font-size:11px;letter-spacing:.18em;font-weight:700;color:#ddf27a">VERDANT</div><h1 style="font-size:34px;line-height:1.1;margin:18px 0 12px">Reset your password.</h1><p style="font-size:16px;line-height:1.65;color:rgba(244,245,233,.74);margin:0">Hi ${escapeHtml(customerName)}, we received a request to reset your Verdant account password.</p><a href="${escapeHtml(resetUrl)}" style="display:inline-block;margin-top:24px;padding:12px 18px;border-radius:999px;background:#ddf27a;color:#101510;text-decoration:none;font-weight:700">Reset password</a></div><p style="padding:24px 8px;font-size:13px;line-height:1.7;color:#555">This link expires in ${RESET_MINUTES} minutes. If you did not request a reset, you can safely ignore this email.</p></div></body></html>`,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return { ok: false, error: detail || "Unable to send the password reset email." };
    }
  } catch {
    return { ok: false, error: "Unable to send the password reset email." };
  }

  return { ok: true };
}

export async function resetPassword(token: string, password: string) {
  const tokenHash = hashToken(token);
  const tokenResult = await supabaseSelect(
    "password_reset_tokens",
    `select=id,customer_id,expires_at,used_at&token_hash=eq.${encodeURIComponent(tokenHash)}&limit=1`,
  );

  const reset = Array.isArray(tokenResult.data) ? tokenResult.data[0] as { id: string; customer_id: string; expires_at: string; used_at: string | null } | undefined : undefined;
  if (!reset || reset.used_at || new Date(reset.expires_at) <= new Date()) {
    return { ok: false, error: "This password reset link is invalid or has expired." };
  }

  const update = await supabaseUpdate(
    "customers",
    `id=eq.${encodeURIComponent(reset.customer_id)}`,
    { password_hash: hashPassword(password), updated_at: new Date().toISOString() },
  );

  if (!update.response?.ok) return { ok: false, error: "Unable to update your password." };

  await supabaseUpdate(
    "password_reset_tokens",
    `id=eq.${encodeURIComponent(reset.id)}`,
    { used_at: new Date().toISOString() },
  );

  await supabaseRest(
    `/rest/v1/customer_sessions?customer_id=eq.${encodeURIComponent(reset.customer_id)}`,
    { method: "DELETE" },
  );

  return { ok: true };
}
