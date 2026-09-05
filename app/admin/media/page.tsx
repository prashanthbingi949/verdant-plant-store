import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminToken } from "@/lib/admin-auth";
import AdminHeader from "@/components/admin-header";
import MediaManager from "./media-manager";

export default async function AdminMediaPage() {
  const store = await cookies();
  if (!verifyAdminToken(store.get(adminCookieName())?.value)) redirect("/admin/login");
  return <main className="min-h-screen bg-[#f4f5e9] text-[#101510]"><AdminHeader section="MEDIA" /><section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14"><p className="text-[10px] font-black tracking-[.2em] text-[#315233]">MEDIA LIBRARY</p><h1 className="mt-3 text-5xl font-semibold tracking-[-.055em] sm:text-6xl">Keep every <em className="font-serif font-normal">asset.</em></h1><p className="mt-4 max-w-2xl text-sm leading-7 text-black/55">One library for transparent product artwork, homepage images, editorial heroes and other reusable site media.</p><MediaManager/></section></main>;
}
