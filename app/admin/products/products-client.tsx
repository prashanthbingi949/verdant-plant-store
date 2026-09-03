"use client";

import { useState } from "react";

type Product = {
  id: string; slug: string; name: string; category: string; level: string; price: number; size: string;
  description: string; details: string[][]; tone: "moss" | "sage" | "lime"; stock: number; active: boolean;
};

export default function AdminProductsClient({ products: initialProducts }: { products: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [open, setOpen] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function save(product: Product) {
    setSaving(product.slug); setNotice(""); setError("");
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(product.slug)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const data = await response.json().catch(() => null);
      if (response.status === 401) { window.location.href = "/admin/login"; return; }
      if (!response.ok) throw new Error(data?.error || "Unable to save product.");
      const saved = data?.product as Product | null;
      if (saved) setProducts((list) => list.map((item) => item.slug === saved.slug ? saved : item));
      setNotice(`${product.name} saved.`); setOpen(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save product.");
    } finally { setSaving(null); }
  }

  function update(slug: string, patch: Partial<Product>) {
    setProducts((list) => list.map((item) => item.slug === slug ? { ...item, ...patch } : item));
  }

  return <section className="mt-10">
    {notice && <p aria-live="polite" className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
    {error && <p role="alert" className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <div className="space-y-3">
      {products.map((product) => {
        const expanded = open === product.slug;
        return <article key={product.slug} className="overflow-hidden rounded-3xl border border-black/10 bg-white/55">
          <button type="button" onClick={() => setOpen(expanded ? null : product.slug)} className="grid w-full gap-4 p-5 text-left sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-sm font-bold">{product.name}</h2><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.08em] ${product.active ? "bg-emerald-100 text-emerald-800" : "bg-black/10 text-black/45"}`}>{product.active ? "Live" : "Hidden"}</span></div><p className="mt-1 text-xs text-black/45">{product.category} · {product.level}</p></div>
            <div className="text-sm font-bold">₹{Number(product.price).toLocaleString("en-IN")}</div>
            <div className={`text-sm font-semibold ${product.stock <= 0 ? "text-red-700" : product.stock <= 5 ? "text-amber-700" : "text-black/60"}`}>{product.stock} in stock</div>
            <span className="hidden text-black/35 sm:block">{expanded ? "−" : "+"}</span>
          </button>
          {expanded && <div className="border-t border-black/10 p-5 sm:p-7">
            <div className="grid gap-5 lg:grid-cols-2">
              <Field label="Product name"><input value={product.name} onChange={(e) => update(product.slug, { name: e.target.value })} /></Field>
              <Field label="Price (₹)"><input type="number" min="0" value={product.price} onChange={(e) => update(product.slug, { price: Math.max(0, Number(e.target.value)) })} /></Field>
              <Field label="Category"><input value={product.category} onChange={(e) => update(product.slug, { category: e.target.value })} /></Field>
              <Field label="Care level"><input value={product.level} onChange={(e) => update(product.slug, { level: e.target.value })} /></Field>
              <Field label="Pot / size"><input value={product.size} onChange={(e) => update(product.slug, { size: e.target.value })} /></Field>
              <Field label="Stock"><input type="number" min="0" value={product.stock} onChange={(e) => update(product.slug, { stock: Math.max(0, Number(e.target.value)) })} /></Field>
              <Field label="Artwork tone"><select value={product.tone} onChange={(e) => update(product.slug, { tone: e.target.value as Product["tone"] })}><option value="moss">Moss</option><option value="sage">Sage</option><option value="lime">Lime</option></select></Field>
              <label className="flex h-full items-center gap-3 rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 text-sm"><input type="checkbox" checked={product.active} onChange={(e) => update(product.slug, { active: e.target.checked })} /> Show this product in the store</label>
            </div>
            <label className="mt-5 block text-sm">Description<textarea value={product.description} onChange={(e) => update(product.slug, { description: e.target.value })} rows={4} /></label>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-black/40">Slug: {product.slug} · The slug stays stable so product links don't break.</p><button type="button" onClick={() => save(product)} disabled={saving === product.slug} className="rounded-full bg-[#202d20] px-5 py-3 text-sm font-bold text-[#f4f5e9] disabled:opacity-60">{saving === product.slug ? "Saving…" : "Save product"}</button></div>
          </div>}
        </article>;
      })}
    </div>
  </section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm">{label}{children}
    <style>{`label > input, label > select { margin-top: .5rem; height: 3rem; width: 100%; border-radius: 1rem; border: 1px solid rgba(0,0,0,.1); background: #f4f5e9; padding: 0 1rem; outline: none; }`}</style>
  </label>;
}
