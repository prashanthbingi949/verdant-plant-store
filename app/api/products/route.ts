import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products";

export async function GET() {
  const products = await getProducts(false);
  return NextResponse.json({ products });
}
