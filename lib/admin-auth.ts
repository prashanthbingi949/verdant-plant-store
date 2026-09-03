import crypto from "node:crypto";

const COOKIE_NAME = "verdant-admin";

function getSecret() {
  return process.env.ADMIN_PASSWORD || "";
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createAdminToken() {
  const secret = getSecret();
  if (!secret) return null;
  const value = "authenticated";
  return `${value}.${sign(value)}`;
}

export function isValidAdminToken(token: string | undefined) {
  const secret = getSecret();
  if (!secret || !token) return false;

  const [value, signature] = token.split(".");
  if (!value || !signature) return false;

  const expected = sign(value);
  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b) && value === "authenticated";
}

export function adminCookieName() {
  return COOKIE_NAME;
}
