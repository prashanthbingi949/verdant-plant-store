import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/password-reset";

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!validEmail(email) || email.length > 254) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
      return NextResponse.json({ error: "Password reset is unavailable right now." }, { status: 503 });
    }

    const result = await requestPasswordReset(email);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 503 });

    return NextResponse.json({
      ok: true,
      message: "If an account exists for that email, we sent a password reset link.",
    });
  } catch {
    return NextResponse.json({ error: "Unable to start password reset." }, { status: 500 });
  }
}
