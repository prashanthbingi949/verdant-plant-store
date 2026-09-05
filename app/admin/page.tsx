import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminToken } from "@/lib/admin-auth";
import AdminHeader from "@/components/admin-header";

const cards = [
  { title: "Homepage", note: "Hero, collections, featured products, care, newsletter and footer.", href: "/admin/home", action: "Edit homepage" },
  { title: "Catalog", note: "Plant and gardening-supply categories and subcategories.", href: "/admin/catalog", action: "Manage catalog" },
  { title: "Products", note: "Products, prices, stock, classification and images.", href: "/admin/products", action: "Manage products" },
  { title: "Orders", note: "Payments, customer details, fulfilment status and revenue.", href: "/admin/orders", action: "View orders" },
  { title: "Site settings", note: "Brand, contact details, social links and navigation.", href: "/admin/site", action: "Edit site" },
  { title: "Pages & Journal", note: "Create, edit, publish and unpublish editorial pages.", href: "/admin/pages", action: "Manage pages" },
  { title: "Media Library", note: "Reusable product artwork, heroes and site images.", href: "/admin/media", action: "Manage media" },
];

export default async function AdminDashboard() {
  const store = await cookies();
  if (!verifyAdminToken(store.get(adminCookieName())?.value)) redirect("/admin/login");

  return (
    <main className="min-h-screen bg-[#f4f5e9] text-[#101510]">
      <AdminHeader section="DASHBOARD" />
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-[10px] font-black tracking-[.2em] text-[#315233]">VERDANT ADMIN</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-5xl font-semibold tracking-[-.055em] sm:text-6xl">Your store, <em className="font-serif font-normal">under control.</em></h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-black/55">One place to manage content, catalog, products, orders and reusable media.</p>
          </div>
          <a href="/" className="w-fit rounded-full bg-[#202d20] px-5 py-3 text-sm font-bold text-[#f4f5e9]">View storefront</a>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <a key={card.href} href={card.href} className="group rounded-3xl border border-black/10 bg-white/60 p-6 transition hover:-translate-y-1 hover:bg-white/80">
              <p className="text-[10px] font-black tracking-[.18em] text-[#315233]">CONTROL</p>
              <h2 className="mt-2 text-2xl font-semibold">{card.title}</h2>
              <p className="mt-3 min-h-12 text-sm leading-6 text-black/50">{card.note}</p>
              <span className="mt-6 inline-flex rounded-full border border-black/10 px-4 py-2 text-xs font-bold">{card.action} →</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
