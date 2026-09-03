"use client";

import { useState } from "react";

type Product = {
  id: string; slug: string; name: string; category: string; level: string; price: number; size: string;
  description: string; details: string[][]; tone: "moss" | "sage" | "lime"; stock: number; active: boolean;
  image_url?: string | null; image_urls?: string[];
};

type Draft = Omit<Product, "id" | "slug"> & { slug: string };

const emptyDraft: Draft = {
  slug: "", name: "", category: "Indoor plants", level: "Easy care", price: 0, size: '6" pot', description: "",
  details: [], tone: "moss", stock: 0, active: true, image_url: null, image_urls: [],
};

export default function AdminProductsClient({ products: initialProducts }: { products: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [open, setOpen] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function uploadFiles(files: FileList | null, slug: string) {
    const selected = Array.from(files || []).slice(0, 8);
    if (!selected.length || !slug) return;
    setUploading(true); setError("");
    try {
      const urls: string[] = [];
      for (const file of selected) {
        const form = new FormData();
        form.append("file", file); form.append("slug", slug);
        const response = await fetch("/api/admin/products/upload", { method: "POST", body: form });
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error || "Unable to upload image.");
        if (data?.url) urls.push(data.url);
      }
      setDraft((value) => ({ ...value, image_url: value.image_url || urls[0] || null, image_urls: [...(value.image_urls || []), ...urls].slice(0, 8) }));
      setNotice(`${urls.length} image${urls.length === 1 ? "" : "s"} uploaded.`);
    } catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "Unable to upload image."); }
    finally { setUploading(false); }
  }

  async function save(product: Product) {
    setSaving(product.slug); setNotice(""); setError("");
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(product.slug)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(product) });
      const data = await response.json().catch(() => null);
      if (response.status === 401) { window.location.href = "/admin/login"; return; }
      if (!response.ok) throw new Error(data?.error || "Unable to save product.");
      const saved = data?.product as Product | null;
      if (saved) setProducts((list) => list.map((item) => item.slug === saved.slug ? saved : item));
      setNotice(`${product.name} saved.`); setOpen(null);
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to save product."); }
    finally { setSaving(null); }
  }

  async function createProduct() {
    setSaving("__new__"); setNotice(""); setError("");
    try {
      const payload = { ...draft, slug: draft.slug || slugify(draft.name), image_url: draft.image_url || null, image_urls: draft.image_urls || [] };
      if (!payload.name.trim()) throw new Error("Product name is required.");
      if (!payload.slug) throw new Error("Product name must contain letters or numbers.");
      const response = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json().catch(() => null);
      if (response.status === 401) { window.location.href = "/admin/login"; return; }
      if (!response.ok) throw new Error(data?.error || "Unable to create product.");
      const created = data?.product as Product | null;
      if (created) setProducts((list) => [...list, created]);
      setDraft(emptyDraft); setCreating(false); setNotice(`${created?.name || payload.name} created.`);
    } catch (createError) { setError(createError instanceof Error ? createError.message : "Unable to create product."); }
    finally { setSaving(null); }
  }

  function update(slug: string, patch: Partial<Product>) { setProducts((list) => list.map((item) => item.slug === slug ? { ...item, ...patch } : item)); }

  return <section className="mt-10">
    {notice && <p aria-live="polite" className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
    {error && <p role="alert" className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

    {!creating ? <button type="button" onClick={() => { setCreating(true); setError(""); setNotice(""); }} className="mb-5 flex w-full items-center justify-between rounded-3xl border border-dashed border-black/20 bg-white/35 p-5 text-left transition hover:bg-white/55"><span><span className="block text-[10px] font-bold tracking-[.16em] text-black/40">CATALOG</span><span className="mt-1 block text-lg font-semibold">+ Add new product</span><span className="mt-1 block text-sm text-black/45">Create a plant, upload its images and publish it to the store.</span></span><span className="rounded-full bg-[#202d20] px-4 py-2 text-xs font-bold text-white">Add</span></button> : <div className="mb-5 rounded-3xl border border-black/10 bg-white/60 p-5 sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold tracking-[.16em] text-black/40">NEW PRODUCT</p><h2 className="mt-2 text-2xl font-semibold">Create your next plant.</h2></div><button type="button" onClick={() => setCreating(false)} className="text-sm text-black/45 hover:text-black">Cancel</button></div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2"><Field label="Product name"><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value, slug: draft.slug || slugify(e.target.value) })} /></Field><Field label="Slug"><input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })} /></Field><Field label="Price (₹)"><input type="number" min="0" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Math.max(0, Number(e.target.value)) })} /></Field><Field label="Stock"><input type="number" min="0" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: Math.max(0, Number(e.target.value)) })} /></Field><Field label="Category"><input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} /></Field><Field label="Care level"><input value={draft.level} onChange={(e) => setDraft({ ...draft, level: e.target.value })} /></Field><Field label="Pot / size"><input value={draft.size} onChange={(e) => setDraft({ ...draft, size: e.target.value })} /></Field><Field label="Artwork tone"><select value={draft.tone} onChange={(e) => setDraft({ ...draft, tone: e.target.value as Product["tone"] })}><option value="moss">Moss</option><option value="sage">Sage</option><option value="lime">Lime</option></select></Field></div>
      <label className="mt-5 block text-sm">Description<textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={5} className="mt-2 min-h-32 w-full resize-y rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 py-3 leading-6 outline-none focus:border-black/25" /></label>
      <ImageManager slug={draft.slug || "new-product"} images={draft.image_urls || []} uploading={uploading} onUpload={(files) => uploadFiles(files, draft.slug || "new-product")} onPrimary={(url) => setDraft({ ...draft, image_url: url })} onRemove={(url) => setDraft({ ...draft, image_url: draft.image_url === url ? null : draft.image_url, image_urls: (draft.image_urls || []).filter((item) => item !== url) })} />
      <div className="mt-6 flex justify-end"><button type="button" onClick={createProduct} disabled={saving === "__new__" || uploading} className="rounded-full bg-[#202d20] px-6 py-3 text-sm font-bold text-[#f4f5e9] disabled:opacity-60">{saving === "__new__" ? "Creating…" : "Create product"}</button></div>
    </div>}

    <div className="space-y-3">{products.map((product) => { const expanded = open === product.slug; return <article key={product.slug} className="overflow-hidden rounded-3xl border border-black/10 bg-white/55"><button type="button" onClick={() => setOpen(expanded ? null : product.slug)} className="grid w-full gap-4 p-5 text-left sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-sm font-bold">{product.name}</h2><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.08em] ${product.active ? "bg-emerald-100 text-emerald-800" : "bg-black/10 text-black/45"}`}>{product.active ? "Live" : "Hidden"}</span></div><p className="mt-1 text-xs text-black/45">{product.category} · {product.level}</p></div><div className="text-sm font-bold">₹{Number(product.price).toLocaleString("en-IN")}</div><div className={`text-sm font-semibold ${product.stock <= 0 ? "text-red-700" : product.stock <= 5 ? "text-amber-700" : "text-black/60"}`}>{product.stock} in stock</div><span className="hidden text-black/35 sm:block">{expanded ? "−" : "+"}</span></button>{expanded && <div className="border-t border-black/10 p-5 sm:p-7"><div className="grid gap-5 lg:grid-cols-2"><Field label="Product name"><input value={product.name} onChange={(e) => update(product.slug, { name: e.target.value })} /></Field><Field label="Price (₹)"><input type="number" min="0" value={product.price} onChange={(e) => update(product.slug, { price: Math.max(0, Number(e.target.value)) })} /></Field><Field label="Category"><input value={product.category} onChange={(e) => update(product.slug, { category: e.target.value })} /></Field><Field label="Care level"><input value={product.level} onChange={(e) => update(product.slug, { level: e.target.value })} /></Field><Field label="Pot / size"><input value={product.size} onChange={(e) => update(product.slug, { size: e.target.value })} /></Field><Field label="Stock"><input type="number" min="0" value={product.stock} onChange={(e) => update(product.slug, { stock: Math.max(0, Number(e.target.value)) })} /></Field><Field label="Artwork tone"><select value={product.tone} onChange={(e) => update(product.slug, { tone: e.target.value as Product["tone"] })}><option value="moss">Moss</option><option value="sage">Sage</option><option value="lime">Lime</option></select></Field><label className="flex min-h-12 items-center gap-3 rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 text-sm"><input type="checkbox" checked={product.active} onChange={(e) => update(product.slug, { active: e.target.checked })} /> Show this product in the store</label></div><label className="mt-5 block text-sm">Description<textarea value={product.description} onChange={(e) => update(product.slug, { description: e.target.value })} rows={5} className="mt-2 min-h-32 w-full resize-y rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 py-3 leading-6 outline-none focus:border-black/25" /></label><ImageManager slug={product.slug} images={product.image_urls || (product.image_url ? [product.image_url] : [])} uploading={uploading && saving === product.slug} onUpload={(files) => { setSaving(product.slug); uploadFiles(files, product.slug).finally(() => setSaving(null)); }} onPrimary={(url) => update(product.slug, { image_url: url })} onRemove={(url) => update(product.slug, { image_url: product.image_url === url ? null : product.image_url, image_urls: (product.image_urls || [product.image_url].filter(Boolean) as string[]).filter((item) => item !== url) })} />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-black/40">Slug: {product.slug} · The slug stays stable so product links don’t break.</p><button type="button" onClick={() => save(product)} disabled={saving === product.slug || uploading} className="rounded-full bg-[#202d20] px-5 py-3 text-sm font-bold text-[#f4f5e9] disabled:opacity-60">{saving === product.slug ? "Saving…" : "Save product"}</button></div></div>}</article>; })}</div>
  </section>;
}

function ImageManager({ slug, images, uploading, onUpload, onPrimary, onRemove }: { slug: string; images: string[]; uploading: boolean; onUpload: (files: FileList | null) => void; onPrimary: (url: string) => void; onRemove: (url: string) => void }) {
  return <div className="mt-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold">Product images</p><p className="mt-1 text-xs text-black/45">Upload up to 8 JPG, PNG, WebP or AVIF images. The first/selected image becomes the primary product image.</p></div><label className="cursor-pointer rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold hover:bg-black/[.03]">{uploading ? "Uploading…" : "+ Add images"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="hidden" onChange={(e) => { onUpload(e.target.files); e.currentTarget.value = ""; }} disabled={uploading || !slug} /></label></div>{images.length ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{images.map((url) => <div key={url} className="group relative overflow-hidden rounded-2xl border border-black/10 bg-[#e2e8d3]"><img src={url} alt="Product preview" className="aspect-square h-full w-full object-cover" /><div className="absolute inset-x-2 bottom-2 flex gap-1"><button type="button" onClick={() => onPrimary(url)} className="flex-1 rounded-full bg-white/90 px-2 py-2 text-[10px] font-bold shadow">Primary</button><button type="button" onClick={() => onRemove(url)} className="rounded-full bg-white/90 px-3 py-2 text-[10px] font-bold text-red-700 shadow">Remove</button></div></div>)}</div> : <div className="mt-4 rounded-2xl border border-dashed border-black/15 bg-black/[.02] p-6 text-center text-xs text-black/40">No images uploaded yet.</div>}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm">{label}{children}<style>{`label > input, label > select { margin-top:.5rem; height:3rem; width:100%; border-radius:1rem; border:1px solid rgba(0,0,0,.1); background:#f4f5e9; padding:0 1rem; outline:none; }`}</style></label>; }
function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
