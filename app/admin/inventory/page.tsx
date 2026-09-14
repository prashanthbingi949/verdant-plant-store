import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminToken } from "@/lib/admin-auth";
import AdminHeader from "@/components/admin-header";
import InventoryClient from "./inventory-client";

export default async function InventoryPage() {
  const store = await cookies();
  if (!verifyAdminToken(store.get(adminCookieName())?.value)) redirect("/admin/login");

  return (
    <main className="min-h-screen bg-[#f4f5e9] text-[#101510]">
      <AdminHeader section="INVENTORY" />
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-[10px] font-black tracking-[.2em] text-[#315233]">STORE OPERATIONS</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-5xl font-semibold tracking-[-.055em] sm:text-6xl">Inventory, <em className="font-serif font-normal">under control.</em></h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-black/55">See stock health, set reorder rules and record every manual stock movement without touching Supabase directly.</p>
          </div>
          <a href="/admin/products" className="w-fit rounded-full border border-black/10 bg-white/55 px-5 py-3 text-sm font-bold">Manage products →</a>
        </div>
        <InventoryClient />
      </section>
    </main>
  );
}
