import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminToken } from "@/lib/admin-auth";
import AdminHeader from "@/components/admin-header";
import SiteManager from "./site-manager";

export default async function AdminSitePage() {
  const cookieStore = await cookies();
  if (!verifyAdminToken(cookieStore.get(adminCookieName())?.value)) redirect("/admin/login");
  return <main className="min-h-screen bg-[#f4f5e9] text-[#101510]"><AdminHeader section="SITE"/><section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14"><p className="text-[10px] font-black tracking-[.2em] text-[#315233]">SITE CMS</p><h1 className="mt-3 text-5xl font-semibold tracking-[-.055em] sm:text-6xl">Control the <em className="font-serif font-normal">whole storefront.</em></h1><p className="mt-4 max-w-2xl text-sm leading-7 text-black/55">Manage brand details, contact information, social links and navigation from one place.</p><SiteManager/></section></main>;
}
