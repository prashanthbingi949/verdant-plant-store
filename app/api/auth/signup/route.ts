import { NextResponse } from "next/server";
import { createCustomer, startCustomerSession } from "@/lib/customer-auth";

function validEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    if (!name || name.length > 120) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    if (!validEmail(email) || email.length > 254) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (password.length < 8 || password.length > 128) return NextResponse.json({ error: "Password must be 8 to 128 characters." }, { status: 400 });

    const result = await createCustomer(name, email, password);
    if (!result.ok) {
      const message = String(result.error || "");
      if (/duplicate|unique/i.test(message)) return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
      return NextResponse.json({ error: "Unable to create your account." }, { status: 500 });
    }
    const sessionStarted = await startCustomerSession(String(result.customer.id));
    if (!sessionStarted) return NextResponse.json({ error: "Account created, but we could not start your session. Please log in." }, { status: 500 });
    return NextResponse.json({ ok: true, customer: { name: result.customer.name, email: result.customer.email } });
  } catch {
    return NextResponse.json({ error: "Unable to create your account." }, { status: 500 });
  }
}
