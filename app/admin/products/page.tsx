import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminToken } from "@/lib/admin-auth";
import { getProducts } from "@/lib/products";
import AdminProductsClient from "./products-client";

export default async function AdminProductsPage() {
  const cookieStore = await cookies();
  if (!verifyAdminToken(cookieStore.get(adminCookieName())?.value)) redirect("/admin/login");
  const products = await getProducts(true);

  return (
    <main className="min-h-screen bg-[#f4f5e9] text-[#101510]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f4f5e9]/90 px-5 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div><Link href="/" className="text-xs font-extrabold tracking-[.2em]">VERDANT</Link><p className="mt-1 text-[10px] font-bold tracking-[.16em] text-black/40">ADMIN / PRODUCTS</p></div>
          <div className="flex gap-2"><Link href="/admin/catalog" className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold">Catalog</Link><Link href="/admin/orders" className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold">Orders</Link><form action="/api/admin/logout" method="post"><button className="rounded-full bg-[#202d20] px-4 py-2 text-sm font-bold text-[#f4f5e9]">Log out</button></form></div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-[10px] font-bold tracking-[.2em] text-black/45">VERDANT ADMIN</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="text-5xl font-semibold tracking-[-.055em] sm:text-6xl">Products <em className="font-serif font-normal">you control.</em></h1><p className="mt-4 max-w-2xl text-sm leading-6 text-black/55">Edit pricing, stock, classification, merchandising and product images without touching the code.</p></div><div className="rounded-2xl border border-black/10 bg-white/50 px-4 py-3 text-sm"><strong>{products.length}</strong> products</div></div>
        <AdminProductsClient products={products} />
      </section>
    </main>
  );
}
