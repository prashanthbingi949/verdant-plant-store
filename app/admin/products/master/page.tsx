import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminToken } from "@/lib/admin-auth";
import AdminHeader from "@/components/admin-header";
import ProductMasterClient from "./product-master-client";

export default async function ProductMasterPage() {
  const cookieStore = await cookies();
  if (!verifyAdminToken(cookieStore.get(adminCookieName())?.value)) redirect("/admin/login");

  return (
    <main className="min-h-screen bg-[#f4f5e9] text-[#101510]">
      <AdminHeader section="PRODUCT MASTER" />
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-[10px] font-black tracking-[.2em] text-[#52634b]">CATALOG SOURCE OF TRUTH</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-5xl font-semibold tracking-[-.055em] sm:text-6xl">Product <em className="font-serif font-normal">master.</em></h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-black/55">One record for identity, pricing, inventory rules, content, exact images, merchandising, SEO and publishing. Changes here are the same fields the storefront should read.</p>
          </div>
          <a href="/admin/products" className="rounded-full border border-black/10 bg-white/55 px-5 py-3 text-sm font-bold">Back to products</a>
        </div>
        <ProductMasterClient />
      </section>
    </main>
  );
}
