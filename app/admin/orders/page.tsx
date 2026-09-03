import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminToken } from "@/lib/admin-auth";
import { supabaseSelect } from "@/lib/supabase-admin";
import AdminOrdersClient from "./orders-client";

type Order = {
  id: string;
  created_at: string;
  order_id: string | null;
  payment_id: string | null;
  customer_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  amount: number | null;
  payment_status: string | null;
  items: Array<{ id: string; name: string; price: number; quantity: number }> | null;
};

export default async function AdminOrdersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;

  if (!verifyAdminToken(token)) redirect("/admin/login");

  const result = await supabaseSelect("orders", "select=*&order=created_at.desc");
  const orders = (Array.isArray(result.data) ? result.data : []) as Order[];

  const paidOrders = orders.filter((order) => order.payment_status === "paid");
  const pendingOrders = orders.filter((order) => order.payment_status !== "paid");
  const revenue = paidOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0);

  return (
    <main className="min-h-screen bg-[#f4f5e9] text-[#101510]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f4f5e9]/90 px-5 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-xs font-extrabold tracking-[.2em]">VERDANT</Link>
            <p className="mt-1 text-[10px] font-bold tracking-[.16em] text-black/40">ADMIN / ORDERS</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/shop" className="hidden rounded-full border border-black/10 px-4 py-2 text-sm font-semibold sm:inline-flex">View store</Link>
            <form action="/api/admin/logout" method="post">
              <button className="rounded-full bg-[#202d20] px-4 py-2 text-sm font-bold text-[#f4f5e9]">Log out</button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[.2em] text-black/45">VERDANT ADMIN</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-[-.055em] sm:text-6xl">Orders <em className="font-serif font-normal">at a glance.</em></h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-black/55">Review paid orders, customer details, payment IDs and what needs to ship next.</p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white/50 px-4 py-3 text-sm"><span className="font-bold">{orders.length}</span> total orders</div>
        </div>

        {!result.configured && (
          <div className="mt-8 rounded-3xl border border-amber-900/15 bg-amber-50 p-5 text-sm text-amber-950">
            Supabase is not configured in this environment. Add <code>SUPABASE_URL</code> and <code>SUPABASE_SECRET_KEY</code> to your server environment.
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total orders" value={orders.length.toLocaleString("en-IN")} />
          <Stat label="Paid orders" value={paidOrders.length.toLocaleString("en-IN")} />
          <Stat label="Pending" value={pendingOrders.length.toLocaleString("en-IN")} />
          <Stat label="Paid revenue" value={`₹${revenue.toLocaleString("en-IN")}`} />
        </div>

        <AdminOrdersClient orders={orders} />
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/50 p-5">
      <p className="text-[10px] font-bold tracking-[.16em] text-black/40">{label.toUpperCase()}</p>
      <p className="mt-3 text-2xl font-semibold tracking-[-.03em]">{value}</p>
    </div>
  );
}
