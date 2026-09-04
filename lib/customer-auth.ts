import crypto from "node:crypto";
import { cookies } from "next/headers";
import { supabaseInsert, supabaseRest, supabaseSelect } from "@/lib/supabase-admin";

const COOKIE_NAME = "verdant-customer";
const SESSION_DAYS = 30;

function hashToken(token: string) { return crypto.createHash("sha256").update(token).digest("hex"); }

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

function verifyPassword(password: string, stored: string) {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, expectedHex] = parts;
  const actual = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function sessionExpiry() { const date = new Date(); date.setDate(date.getDate() + SESSION_DAYS); return date.toISOString(); }

export async function createCustomer(name: string, email: string, password: string) {
  const result = await supabaseInsert("customers", { name, email: email.toLowerCase(), password_hash: hashPassword(password) });
  if (!result.response?.ok) return { ok: false, error: result.data?.message || "Unable to create your account." };
  const customer = Array.isArray(result.data) ? result.data[0] : null;
  if (!customer?.id) return { ok: false, error: "Unable to create your account." };
  return { ok: true, customer };
}

export async function findCustomerByEmail(email: string) {
  const result = await supabaseSelect("customers", `select=*&email=eq.${encodeURIComponent(email.toLowerCase())}&limit=1`);
  if (!result.response?.ok) return null;
  return Array.isArray(result.data) ? result.data[0] ?? null : null;
}

export async function verifyCustomerPassword(email: string, password: string) {
  const customer = await findCustomerByEmail(email);
  if (!customer || typeof customer.password_hash !== "string" || !verifyPassword(password, customer.password_hash)) return null;
  return customer;
}

export async function startCustomerSession(customerId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const result = await supabaseInsert("customer_sessions", { customer_id: customerId, token_hash: hashToken(token), expires_at: sessionExpiry() });
  if (!result.response?.ok) return false;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_DAYS * 24 * 60 * 60 });
  return true;
}

export async function getCurrentCustomer() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const sessionResult = await supabaseSelect("customer_sessions", `select=customer_id,expires_at&token_hash=eq.${hashToken(token)}&limit=1`);
  const session = Array.isArray(sessionResult.data) ? sessionResult.data[0] : null;
  if (!session?.customer_id || !session.expires_at || new Date(session.expires_at) <= new Date()) return null;
  const customerResult = await supabaseSelect("customers", `select=id,name,email,phone,address,city,state,pincode,created_at&id=eq.${encodeURIComponent(String(session.customer_id))}&limit=1`);
  return Array.isArray(customerResult.data) ? customerResult.data[0] ?? null : null;
}

export async function clearCustomerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) await supabaseRest(`/rest/v1/customer_sessions?token_hash=eq.${hashToken(token)}`, { method: "DELETE" });
  cookieStore.set(COOKIE_NAME, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}
