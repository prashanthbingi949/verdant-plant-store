import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";

export async function GET() {
  const customer = await getCurrentCustomer();
  return NextResponse.json({
    authenticated: Boolean(customer),
    customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
  });
}
