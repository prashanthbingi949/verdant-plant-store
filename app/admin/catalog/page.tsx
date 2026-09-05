import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminToken } from "@/lib/admin-auth";
import CatalogManager from "./catalog-manager";

export default async function CatalogPage() {
  const cookieStore = await cookies();
  if (!verifyAdminToken(cookieStore.get(adminCookieName())?.value)) redirect("/admin/login");

  return (
    <main className="min-h-screen bg-[#f4f5e9] text-[#101510]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f4f5e9]/90 px-5 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-xs font-extrabold tracking-[.2em]">VERDANT</Link>
            <p className="mt-1 text-[10px] font-bold tracking-[.16em] text-black/40">ADMIN / CATALOG</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Link href="/admin/products" className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold">Products</Link>
            <Link href="/admin/orders" className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold">Orders</Link>
            <form action="/api/admin/logout" method="post">
              <button type="submit" className="rounded-full bg-[#202d20] px-4 py-2 text-sm font-bold text-[#f4f5e9]">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <CatalogManager />
    </main>
  );
}
