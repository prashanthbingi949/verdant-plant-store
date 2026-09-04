import { NextResponse } from "next/server";
import { startCustomerSession, verifyCustomerPassword } from "@/lib/customer-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    if (!email || !password) return NextResponse.json({ error: "Please enter your email and password." }, { status: 400 });

    const customer = await verifyCustomerPassword(email, password);
    if (!customer) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    const sessionStarted = await startCustomerSession(String(customer.id));
    if (!sessionStarted) return NextResponse.json({ error: "Unable to start your session. Please try again." }, { status: 500 });
    return NextResponse.json({ ok: true, customer: { name: customer.name, email: customer.email } });
  } catch {
    return NextResponse.json({ error: "Unable to log in." }, { status: 500 });
  }
}
