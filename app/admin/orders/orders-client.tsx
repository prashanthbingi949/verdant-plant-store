"use client";

import { useMemo, useState } from "react";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

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
  order_status: string | null;
  items: OrderItem[] | null;
};

const filters = ["all", "awaiting_payment", "paid", "packed", "shipped", "delivered", "cancelled"] as const;
type Filter = (typeof filters)[number];

const statusOptions = ["awaiting_payment", "paid", "packed", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = (typeof statusOptions)[number];

export default function AdminOrdersClient({ orders: initialOrders }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const status = normalizeStatus(order.order_status, order.payment_status);
      if (filter !== "all" && status !== filter) return false;
      if (!query) return true;

      const haystack = [
        order.order_id,
        order.payment_id,
        order.customer_name,
        order.email,
        order.phone,
        order.city,
        order.pincode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [filter, orders, search]);

  async function updateStatus(orderId: string | null, status: OrderStatus) {
    if (!orderId || updatingId) return;
    setUpdatingId(orderId);
    setError("");

    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json().catch(() => null);
      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!response.ok) throw new Error(data?.error || "Unable to update order.");

      setOrders((current) => current.map((order) => order.order_id === orderId ? { ...order, order_status: status } : order));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update order.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="mt-10">
      <div className="flex flex-col gap-3 rounded-3xl border border-black/10 bg-white/55 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1">
            <svg aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, customer, email or payment ID" className="h-11 w-full rounded-2xl border border-black/10 bg-white/75 pl-11 pr-4 text-sm outline-none placeholder:text-black/35 focus:border-black/25" />
          </div>
          <div className="flex flex-wrap gap-1 rounded-2xl bg-black/[.045] p-1">
            {filters.map((value) => (
              <button key={value} onClick={() => setFilter(value)} className={`rounded-xl px-3 py-2 text-[11px] font-bold capitalize transition ${filter === value ? "bg-[#202d20] text-[#f4f5e9]" : "text-black/50 hover:text-black"}`}>
                {labelFor(value)}
              </button>
            ))}
          </div>
        </div>
        {error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      </div>

      <div className="mt-5 space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-black/15 bg-white/40 p-10 text-center">
            <p className="text-lg font-semibold">No orders found.</p>
            <p className="mt-2 text-sm text-black/45">Try a different search or status.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const paymentPaid = order.payment_status === "paid";
            const status = normalizeStatus(order.order_status, order.payment_status);
            const expanded = openId === order.id;
            const items = Array.isArray(order.items) ? order.items : [];

            return (
              <article key={order.id} className="overflow-hidden rounded-3xl border border-black/10 bg-white/55">
                <button onClick={() => setOpenId(expanded ? null : order.id)} className="grid w-full gap-4 p-5 text-left sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-bold">{order.order_id || "Order"}</span>
                      <StatusBadge status={status} />
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.08em] ${paymentPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{paymentPaid ? "Payment paid" : "Payment pending"}</span>
                    </div>
                    <p className="mt-1 truncate text-sm text-black/55">{order.customer_name || "Customer"} · {order.email || "No email"}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold">₹{Number(order.amount || 0).toLocaleString("en-IN")}</p>
                    <p className="mt-1 text-xs text-black/40">{formatDate(order.created_at)}</p>
                  </div>
                  <span className="hidden text-black/35 sm:block">{expanded ? "−" : "+"}</span>
                </button>

                {expanded && (
                  <div className="border-t border-black/10 px-5 pb-5 pt-5">
                    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                      <div>
                        <p className="text-[10px] font-bold tracking-[.16em] text-black/40">CUSTOMER</p>
                        <div className="mt-3 space-y-1 text-sm text-black/70">
                          <p className="font-semibold text-black">{order.customer_name || "—"}</p>
                          <p>{order.email || "—"}</p>
                          <p>{order.phone || "—"}</p>
                          <p className="pt-2 leading-6">{[order.address, order.city, order.state, order.pincode].filter(Boolean).join(", ") || "Address unavailable"}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-[.16em] text-black/40">FULFILLMENT</p>
                        <div className="mt-3 flex flex-col gap-3">
                          <label className="text-xs font-semibold text-black/45">Order status
                            <select value={status} onChange={(event) => updateStatus(order.order_id, event.target.value as OrderStatus)} disabled={updatingId === order.order_id} className="mt-2 h-11 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm font-semibold text-black outline-none focus:border-black/25 disabled:opacity-60">
                              {statusOptions.map((option) => <option key={option} value={option}>{labelFor(option)}</option>)}
                            </select>
                          </label>
                          <div className="space-y-2 text-sm text-black/65">
                            <p><span className="text-black/40">Payment:</span> <strong className="text-black">{order.payment_status || "unknown"}</strong></p>
                            <p className="break-all"><span className="text-black/40">Payment ID:</span> {order.payment_id || "Not available"}</p>
                            <p className="break-all"><span className="text-black/40">Order ID:</span> {order.order_id || "Not available"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-7">
                      <p className="text-[10px] font-bold tracking-[.16em] text-black/40">ITEMS</p>
                      <div className="mt-3 divide-y divide-black/10 rounded-2xl border border-black/10 bg-white/45">
                        {items.length === 0 ? (
                          <p className="p-4 text-sm text-black/45">No item details recorded.</p>
                        ) : items.map((item) => (
                          <div key={`${item.id}-${item.name}`} className="flex items-center justify-between gap-4 p-4 text-sm">
                            <div className="min-w-0"><p className="truncate font-semibold">{item.name}</p><p className="mt-1 text-xs text-black/40">Qty {item.quantity}</p></div>
                            <p className="shrink-0 font-semibold">₹{(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString("en-IN")}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

function normalizeStatus(orderStatus: string | null, paymentStatus: string | null): OrderStatus {
  if (statusOptions.includes(orderStatus as OrderStatus)) return orderStatus as OrderStatus;
  return paymentStatus === "paid" ? "paid" : "awaiting_payment";
}

function labelFor(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const classes: Record<OrderStatus, string> = {
    awaiting_payment: "bg-amber-100 text-amber-800",
    paid: "bg-emerald-100 text-emerald-800",
    packed: "bg-blue-100 text-blue-800",
    shipped: "bg-violet-100 text-violet-800",
    delivered: "bg-lime-100 text-lime-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.08em] ${classes[status]}`}>{labelFor(status)}</span>;
}

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
