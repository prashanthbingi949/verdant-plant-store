import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/password-reset";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!token) return NextResponse.json({ error: "This password reset link is invalid." }, { status: 400 });
    if (password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: "Password must be 8 to 128 characters." }, { status: 400 });
    }

    const result = await resetPassword(token, password);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to reset your password." }, { status: 500 });
  }
}
