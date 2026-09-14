"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  slug: string;
  name: string;
  category: string;
  stock: number;
  active: boolean;
  price: number;
  image_url?: string | null;
};

type Setting = {
  product_slug: string;
  reorder_level: number;
  reorder_quantity: number;
};

type Movement = {
  id: string;
  created_at: string;
  product_slug: string;
  quantity_delta: number;
  stock_after: number;
  reason: string;
  note: string;
};

const reasons = [
  ["received", "Stock received"],
  ["damaged", "Damaged / lost"],
  ["correction", "Stock correction"],
  ["manual_adjustment", "Manual adjustment"],
] as const;

export default function InventoryClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Record<string, Setting>>({});
  const [movements, setMovements] = useState<Movement[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [open, setOpen] = useState<string | null>(null);
  const [delta, setDelta] = useState<Record<string, string>>({});
  const [reason, setReason] = useState<Record<string, string>>({});
  const [note, setNote] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const response = await fetch("/api/admin/inventory", { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Unable to load inventory.");
      setProducts(Array.isArray(data?.products) ? data.products : []);
      const map: Record<string, Setting> = {};
      for (const item of Array.isArray(data?.settings) ? data.settings : []) map[item.product_slug] = item;
      setSettings(map);
      setMovements(Array.isArray(data?.movements) ? data.movements : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load inventory.");
    }
  };

  useEffect(() => { load(); }, []);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const setting = settings[product.slug] || { reorder_level: 5, reorder_quantity: 10 };
      const matchesSearch = !term || product.name.toLowerCase().includes(term) || product.slug.includes(term) || product.category.toLowerCase().includes(term);
      const low = product.stock > 0 && product.stock <= setting.reorder_level;
      const out = product.stock === 0;
      const matchesFilter = filter === "all" || (filter === "low" && low) || (filter === "out" && out);
      return matchesSearch && matchesFilter;
    });
  }, [products, settings, search, filter]);

  const outCount = products.filter((product) => product.stock === 0).length;
  const lowCount = products.filter((product) => {
    const level = settings[product.slug]?.reorder_level ?? 5;
    return product.stock > 0 && product.stock <= level;
  }).length;
  const units = products.reduce((sum, product) => sum + Number(product.stock || 0), 0);

  async function adjust(product: Product, fallbackDelta = 0) {
    const parsed = Number(delta[product.slug]);
    const amount = Number.isFinite(parsed) && parsed !== 0 ? Math.round(parsed) : fallbackDelta;
    if (!amount) return;
    setSaving(product.slug);
    setMessage(""); setError("");
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: product.slug,
          action: "adjust-stock",
          delta: amount,
          reason: reason[product.slug] || "manual_adjustment",
          note: note[product.slug] || "",
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Unable to adjust stock.");
      if (data?.product) setProducts((list) => list.map((item) => item.slug === product.slug ? data.product : item));
      setDelta((current) => ({ ...current, [product.slug]: "" }));
      setNote((current) => ({ ...current, [product.slug]: "" }));
      setMovements((list) => data?.movement ? [data.movement, ...list].slice(0, 80) : list);
      setMessage(`${product.name}: stock updated.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to adjust stock.");
    } finally {
      setSaving(null);
    }
  }

  async function saveSettings(product: Product) {
    const current = settings[product.slug] || { product_slug: product.slug, reorder_level: 5, reorder_quantity: 10 };
    setSaving(`${product.slug}:settings`);
    setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: product.slug, action: "settings", reorder_level: current.reorder_level, reorder_quantity: current.reorder_quantity }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Unable to save reorder settings.");
      if (data?.settings) setSettings((map) => ({ ...map, [product.slug]: data.settings }));
      setMessage(`${product.name}: reorder settings saved.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save reorder settings.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="mt-10">
      {message && <p aria-live="polite" className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}
      {error && <p role="alert" className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 md:grid-cols-4">
        {[['Active SKUs', products.filter((p) => p.active).length], ['Units on hand', units], ['Low stock', lowCount], ['Out of stock', outCount]].map(([label, value]) => (
          <div key={String(label)} className="rounded-3xl border border-black/10 bg-white/60 p-5">
            <p className="text-[10px] font-black tracking-[.16em] text-black/40">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-.04em]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-black/10 bg-white/55 p-4 sm:flex-row sm:items-center">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product, slug or category…" className="min-w-0 flex-1 rounded-full border border-black/10 bg-[#f4f5e9] px-4 py-3 text-sm outline-none" />
        <div className="flex gap-2">
          {([["all", "All"], ["low", "Low stock"], ["out", "Out of stock"]] as const).map(([value, label]) => (
            <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-xs font-bold ${filter === value ? "bg-[#202d20] text-[#f4f5e9]" : "border border-black/10 bg-white/60"}`}>{label}</button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((product) => {
          const setting = settings[product.slug] || { product_slug: product.slug, reorder_level: 5, reorder_quantity: 10 };
          const low = product.stock > 0 && product.stock <= setting.reorder_level;
          const out = product.stock === 0;
          const expanded = open === product.slug;
          return (
            <article key={product.slug} className="overflow-hidden rounded-3xl border border-black/10 bg-white/60">
              <button type="button" onClick={() => setOpen(expanded ? null : product.slug)} className="grid w-full gap-3 p-5 text-left md:grid-cols-[1fr_auto_auto_auto] md:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-sm font-bold">{product.name}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[.08em] ${out ? "bg-red-100 text-red-800" : low ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{out ? "Out of stock" : low ? "Low stock" : "Healthy"}</span>
                  </div>
                  <p className="mt-1 text-xs text-black/45">{product.slug} · {product.category}</p>
                </div>
                <div className="text-right"><p className="text-[10px] font-black tracking-[.12em] text-black/35">ON HAND</p><p className="text-2xl font-bold">{product.stock}</p></div>
                <div className="text-right"><p className="text-[10px] font-black tracking-[.12em] text-black/35">REORDER AT</p><p className="text-sm font-bold">{setting.reorder_level}</p></div>
                <span className="hidden text-black/35 md:block">{expanded ? "−" : "+"}</span>
              </button>

              {expanded && (
                <div className="border-t border-black/10 p-5 sm:p-7">
                  <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
                    <div>
                      <p className="text-[10px] font-black tracking-[.16em] text-black/40">STOCK MOVEMENT</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button type="button" onClick={() => adjust(product, 1)} disabled={saving === product.slug} className="rounded-full bg-[#202d20] px-4 py-2 text-xs font-bold text-[#f4f5e9]">+1</button>
                        <button type="button" onClick={() => adjust(product, 5)} disabled={saving === product.slug} className="rounded-full bg-[#202d20] px-4 py-2 text-xs font-bold text-[#f4f5e9]">+5</button>
                        <button type="button" onClick={() => adjust(product, -1)} disabled={product.stock < 1 || saving === product.slug} className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold">−1</button>
                        <input aria-label="Custom stock adjustment" value={delta[product.slug] || ""} onChange={(e) => setDelta((map) => ({ ...map, [product.slug]: e.target.value }))} placeholder="+12 / -3" className="w-28 rounded-full border border-black/10 bg-[#f4f5e9] px-4 py-2 text-xs outline-none" />
                        <button type="button" onClick={() => adjust(product)} disabled={!delta[product.slug] || saving === product.slug} className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold disabled:opacity-40">Apply</button>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <select value={reason[product.slug] || "manual_adjustment"} onChange={(e) => setReason((map) => ({ ...map, [product.slug]: e.target.value }))} className="rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 py-3 text-sm outline-none">
                          {reasons.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                        <input value={note[product.slug] || ""} onChange={(e) => setNote((map) => ({ ...map, [product.slug]: e.target.value }))} placeholder="Optional note (supplier, damaged, count…)" className="rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 py-3 text-sm outline-none" />
                      </div>
                    </div>

                    <div className="rounded-3xl border border-black/10 bg-[#f4f5e9] p-5">
                      <p className="text-[10px] font-black tracking-[.16em] text-black/40">REORDER RULE</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        <label className="text-xs font-bold">Reorder level<input type="number" min="0" value={setting.reorder_level} onChange={(e) => setSettings((map) => ({ ...map, [product.slug]: { ...setting, reorder_level: Math.max(0, Number(e.target.value)) } }))} className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none" /></label>
                        <label className="text-xs font-bold">Reorder quantity<input type="number" min="1" value={setting.reorder_quantity} onChange={(e) => setSettings((map) => ({ ...map, [product.slug]: { ...setting, reorder_quantity: Math.max(1, Number(e.target.value)) } }))} className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none" /></label>
                      </div>
                      <button type="button" onClick={() => saveSettings(product)} disabled={saving === `${product.slug}:settings`} className="mt-4 w-full rounded-full bg-[#202d20] px-5 py-3 text-sm font-bold text-[#f4f5e9] disabled:opacity-60">{saving === `${product.slug}:settings` ? "Saving…" : "Save reorder rule"}</button>
                    </div>
                  </div>

                  <div className="mt-7 border-t border-black/10 pt-6">
                    <p className="text-[10px] font-black tracking-[.16em] text-black/40">RECENT MOVEMENTS</p>
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full min-w-[620px] text-left text-xs">
                        <thead><tr className="border-b border-black/10 text-black/40"><th className="py-2 pr-4">When</th><th className="py-2 pr-4">Change</th><th className="py-2 pr-4">After</th><th className="py-2 pr-4">Reason</th><th className="py-2">Note</th></tr></thead>
                        <tbody>
                          {movements.filter((item) => item.product_slug === product.slug).slice(0, 8).map((item) => (
                            <tr key={item.id} className="border-b border-black/5"><td className="py-3 pr-4">{new Date(item.created_at).toLocaleString()}</td><td className={`py-3 pr-4 font-bold ${item.quantity_delta > 0 ? "text-emerald-700" : "text-red-700"}`}>{item.quantity_delta > 0 ? "+" : ""}{item.quantity_delta}</td><td className="py-3 pr-4 font-bold">{item.stock_after}</td><td className="py-3 pr-4">{item.reason}</td><td className="py-3">{item.note || "—"}</td></tr>
                          ))}
                          {!movements.some((item) => item.product_slug === product.slug) && <tr><td colSpan={5} className="py-6 text-black/40">No manual movements recorded yet.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
