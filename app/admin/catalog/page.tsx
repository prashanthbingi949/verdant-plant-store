import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminToken } from "@/lib/admin-auth";
import AdminHeader from "@/components/admin-header";
import CatalogManager from "./catalog-manager";

export default async function CatalogPage() {
  const cookieStore = await cookies();
  if (!verifyAdminToken(cookieStore.get(adminCookieName())?.value)) redirect("/admin/login");

  return (
    <main className="min-h-screen bg-[#f4f5e9] text-[#101510]">
      <AdminHeader section="CATALOG" />
      <CatalogManager />
    </main>
  );
}
