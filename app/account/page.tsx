import Link from "next/link";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { supabaseSelect } from "@/lib/supabase-admin";
import LogoutButton from "@/components/logout-button";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return (
      <main className="min-h-screen bg-[#eef2df] px-5 py-8 text-[#101510] sm:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col">
          <header className="flex items-center justify-between border-b-2 border-[#202d20]/15 pb-5">
            <Link href="/" className="text-sm font-black tracking-[0.2em] text-[#172217]">VERDANT</Link>
            <Link href="/shop" className="rounded-full bg-[#202d20] px-5 py-2.5 text-sm font-bold text-[#f4f5e9]">Shop plants</Link>
          </header>
          <section className="flex flex-1 items-center justify-center py-20 text-center">
            <div className="max-w-lg rounded-[32px] border-2 border-[#202d20]/15 bg-[#fafbf4] p-10 shadow-[0_18px_60px_rgba(32,45,32,0.12)]">
              <p className="text-[10px] font-black tracking-[0.22em] text-[#315233]">VERDANT ACCOUNT</p>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.05em]">Please log in first.</h1>
              <p className="mt-4 text-sm font-medium leading-7 text-[#31422f]">Log in to see your saved details, orders and tracking information.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/login" className="inline-flex items-center justify-center rounded-full bg-[#202d20] px-5 py-3 text-sm font-bold text-[#f4f5e9]">Log in</Link>
                <Link href="/signup" className="inline-flex items-center justify-center rounded-full border-2 border-[#202d20] px-5 py-3 text-sm font-bold text-[#202d20]">Sign up</Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const ordersResult = await supabaseSelect(
    "orders",
    `select=order_id,payment_id,amount,payment_status,order_status,created_at,items&customer_id=eq.${encodeURIComponent(String(customer.id))}&order=created_at.desc&limit=20`,
  );
  const orders = Array.isArray(ordersResult.data) ? ordersResult.data : [];

  return (
    <main className="min-h-screen bg-[#eef2df] px-5 py-8 text-[#101510] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b-2 border-[#202d20]/15 pb-5">
          <Link href="/" className="text-sm font-black tracking-[0.2em] text-[#172217]">VERDANT</Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/shop" className="rounded-full border-2 border-[#202d20] px-4 py-2 text-sm font-bold text-[#202d20]">Shop plants</Link>
            <LogoutButton />
          </div>
        </header>

        <section className="py-14 sm:py-18">
          <p className="text-[10px] font-black tracking-[0.22em] text-[#315233]">YOUR VERDANT ACCOUNT</p>
          <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-5xl font-black leading-[0.92] tracking-[-0.06em] sm:text-7xl">Hello, {String(customer.name).split(" ")[0]}.</h1>
              <p className="mt-4 text-sm font-medium text-[#31422f]">{customer.email}</p>
            </div>
            <div className="rounded-3xl border-2 border-[#202d20]/10 bg-[#fafbf4] px-5 py-4 text-sm font-bold shadow-sm">{orders.length} order{orders.length === 1 ? "" : "s"} saved</div>
          </div>
        </section>

        <section className="grid gap-6 pb-20 lg:grid-cols-[.8fr_1.7fr]">
          <div className="rounded-[32px] border-2 border-[#202d20]/10 bg-[#fafbf4] p-7 shadow-sm">
            <p className="text-[10px] font-black tracking-[0.2em] text-[#315233]">CUSTOMER DETAILS</p>
            <div className="mt-6 space-y-5 text-sm">
              <div><p className="font-bold text-[#596654]">Name</p><p className="mt-1 font-semibold">{customer.name}</p></div>
              <div><p className="font-bold text-[#596654]">Email</p><p className="mt-1 font-semibold">{customer.email}</p></div>
              <p className="text-xs leading-5 text-[#596654]">Delivery details are saved with each order so your order history stays complete.</p>
            </div>
          </div>

          <div className="rounded-[32px] border-2 border-[#202d20]/10 bg-[#fafbf4] p-7 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] font-black tracking-[0.2em] text-[#315233]">ORDER HISTORY</p>
              <Link href="/order-tracking" className="text-xs font-black text-[#315233] underline underline-offset-4">Track an order</Link>
            </div>
            {orders.length === 0 ? (
              <div className="py-12 text-center"><h2 className="text-2xl font-black">No orders yet.</h2><p className="mt-2 text-sm text-[#596654]">Your paid orders will appear here.</p><Link href="/shop" className="mt-6 inline-flex rounded-full bg-[#202d20] px-5 py-3 text-sm font-bold text-[#f4f5e9]">Start shopping</Link></div>
            ) : (
              <div className="mt-6 space-y-3">
                {orders.map((order: any) => (
                  <div key={order.order_id} className="rounded-3xl border border-[#202d20]/10 bg-[#eef2df] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div><p className="text-xs font-black tracking-[0.08em]">{order.order_id}</p><p className="mt-1 text-xs text-[#596654]">{new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p></div>
                      <div className="text-left sm:text-right"><p className="text-lg font-black">₹{Number(order.amount).toLocaleString("en-IN")}</p><p className="mt-1 text-xs font-bold text-[#315233]">{String(order.order_status || order.payment_status).replace(/_/g, " ")}</p></div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {order.payment_id && <Link href={`/order-tracking?order=${encodeURIComponent(order.order_id)}&payment=${encodeURIComponent(order.payment_id)}`} className="rounded-full bg-[#202d20] px-4 py-2 text-xs font-bold text-[#f4f5e9]">Track order</Link>}
                      <Link href="/shop" className="rounded-full border border-[#202d20]/30 px-4 py-2 text-xs font-bold text-[#202d20]">Shop again</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
