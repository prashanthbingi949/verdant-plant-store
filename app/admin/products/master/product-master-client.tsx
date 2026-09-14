"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string; slug: string; name: string; product_type?: string; category: string; subcategory?: string;
  level: string; price: number; compare_at_price?: number | null; cost_price?: number | null; tax_rate?: number; tax_code?: string;
  size: string; description: string; short_description?: string; personality_line?: string; details: string[][];
  tone: "moss" | "sage" | "lime"; stock: number; active: boolean; featured?: boolean; sort_order?: number;
  badge_text?: string; image_url?: string | null; image_urls?: string[]; image_alt_text?: string; image_alt_texts?: string[];
  sku?: string; seo_title?: string; seo_description?: string; canonical_slug?: string;
  related_product_slugs?: string[]; complete_corner_slugs?: string[]; publish_status?: "published" | "draft" | "archived";
  preview_enabled?: boolean; updated_at?: string;
};

const tabs = ["Identity", "Commercial", "Inventory", "Content", "Images", "Merchandising", "SEO", "Publishing"] as const;
type Tab = typeof tabs[number];

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180); }
function arr(value?: string[]) { return value?.join(", ") || ""; }
function parseSlugs(value: string) { return Array.from(new Set(value.split(",").map((item) => slugify(item)).filter(Boolean))); }
function money(value?: number | null) { return value == null ? "" : String(value); }

export default function ProductMasterClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState("");
  const [tab, setTab] = useState<Tab>("Identity");
  const [draft, setDraft] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/products/master", { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (response.status === 401) { window.location.href = "/admin/login"; return; }
      if (!response.ok) throw new Error(data?.error || "Unable to load products.");
      const list = Array.isArray(data?.products) ? data.products : [];
      setProducts(list);
      if (!selected && list[0]) { setSelected(list[0].slug); setDraft(list[0]); }
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load products."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!selected) return;
    const next = products.find((item) => item.slug === selected);
    if (next) setDraft(next);
  }, [selected, products]);

  const visible = useMemo(() => products.filter((item) => `${item.name} ${item.slug} ${item.sku || ""}`.toLowerCase().includes(search.toLowerCase().trim())), [products, search]);
  const margin = draft?.cost_price != null && Number(draft.price) > 0 ? ((Number(draft.price) - Number(draft.cost_price)) / Number(draft.price)) * 100 : null;
  const imageCount = draft?.image_urls?.length || (draft?.image_url ? 1 : 0);

  const setField = <K extends keyof Product>(key: K, value: Product[K]) => setDraft((current) => current ? { ...current, [key]: value } : current);

  async function save() {
    if (!draft) return;
    setSaving(true); setNotice(""); setError("");
    try {
      const payload = {
        ...draft,
        related_product_slugs: draft.related_product_slugs || [],
        complete_corner_slugs: draft.complete_corner_slugs || [],
        image_alt_texts: draft.image_alt_texts || [],
        updated_at: undefined,
      };
      const response = await fetch("/api/admin/products/master", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json().catch(() => null);
      if (response.status === 401) { window.location.href = "/admin/login"; return; }
      if (!response.ok || !data?.product) throw new Error(data?.error || "Unable to save product.");
      setProducts((list) => list.map((item) => item.slug === draft.slug ? data.product : item));
      setDraft(data.product);
      setNotice(`${data.product.name} saved.`);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save product."); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="mt-10 rounded-3xl border border-black/10 bg-white/50 p-10 text-sm text-black/50">Loading Product Master…</div>;

  return (
    <div className="mt-10 grid gap-5 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-3xl border border-black/10 bg-white/45 p-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="h-11 w-full rounded-full border border-black/10 bg-[#f4f5e9] px-4 text-sm outline-none" />
        <div className="mt-3 space-y-2">
          {visible.map((product) => <button key={product.slug} type="button" onClick={() => setSelected(product.slug)} className={`w-full rounded-2xl border px-4 py-3 text-left ${selected === product.slug ? "border-[#202d20] bg-[#202d20] text-[#f4f5e9]" : "border-black/8 bg-white/45 hover:bg-white/70"}`}>
            <span className="block truncate text-sm font-bold">{product.name}</span>
            <span className={`mt-1 block truncate text-[10px] ${selected === product.slug ? "text-white/60" : "text-black/40"}`}>{product.sku || product.slug} · {product.publish_status || (product.active ? "published" : "hidden")}</span>
          </button>)}
        </div>
      </aside>

      <section className="rounded-3xl border border-black/10 bg-white/55 p-5 sm:p-7">
        {draft && <>
          <div className="flex flex-col gap-4 border-b border-black/8 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="text-[10px] font-black tracking-[.18em] text-[#52634b]">MASTER RECORD</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.04em]">{draft.name}</h2><p className="mt-1 text-xs text-black/45">/{draft.slug} · updated {draft.updated_at ? new Date(draft.updated_at).toLocaleString("en-IN") : "not yet"}</p></div>
            <div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#ddf27a] px-3 py-2 text-[10px] font-black">{draft.stock} on hand</span><span className="rounded-full border border-black/10 bg-white/60 px-3 py-2 text-[10px] font-black">{imageCount} images</span>{margin != null && <span className="rounded-full border border-black/10 bg-white/60 px-3 py-2 text-[10px] font-black">{margin.toFixed(1)}% gross margin</span>}</div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">{tabs.map((item) => <button type="button" key={item} onClick={() => setTab(item)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold ${tab === item ? "bg-[#202d20] text-[#f4f5e9]" : "border border-black/10 bg-white/55"}`}>{item}</button>)}</div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {tab === "Identity" && <>
              <Field label="Product name"><input value={draft.name} onChange={(e) => setField("name", e.target.value)} /></Field>
              <Field label="Stable slug"><input value={draft.slug} disabled /></Field>
              <Field label="SKU"><input value={draft.sku || ""} onChange={(e) => setField("sku", e.target.value.toUpperCase())} placeholder="VERD-001" /></Field>
              <Field label="Product type"><select value={draft.product_type || "Plants"} onChange={(e) => setField("product_type", e.target.value)}><option>Plants</option><option>Gardening Supplies</option></select></Field>
              <Field label="Category"><input value={draft.category} onChange={(e) => setField("category", e.target.value)} /></Field>
              <Field label="Sub-category"><input value={draft.subcategory || ""} onChange={(e) => setField("subcategory", e.target.value)} /></Field>
            </>}

            {tab === "Commercial" && <>
              <Field label="Selling price (₹)"><input type="number" min="0" value={draft.price} onChange={(e) => setField("price", Math.max(0, Number(e.target.value)))} /></Field>
              <Field label="Compare-at / original price (₹)"><input type="number" min="0" value={money(draft.compare_at_price)} onChange={(e) => setField("compare_at_price", e.target.value === "" ? null : Math.max(0, Number(e.target.value)))} /></Field>
              <Field label="Cost price (₹)"><input type="number" min="0" value={money(draft.cost_price)} onChange={(e) => setField("cost_price", e.target.value === "" ? null : Math.max(0, Number(e.target.value)))} /></Field>
              <Field label="Margin"><input value={margin == null ? "—" : `${margin.toFixed(1)}%`} disabled /></Field>
              <Field label="Size / pack"><input value={draft.size} onChange={(e) => setField("size", e.target.value)} /></Field>
              <Field label="GST / tax rate %"><input type="number" min="0" value={draft.tax_rate ?? 0} onChange={(e) => setField("tax_rate", Math.max(0, Number(e.target.value)))} /></Field>
              <Field label="HSN / tax code"><input value={draft.tax_code || ""} onChange={(e) => setField("tax_code", e.target.value)} /></Field>
            </>}

            {tab === "Inventory" && <>
              <Field label="On-hand stock"><input type="number" min="0" value={draft.stock} onChange={(e) => setField("stock", Math.max(0, Number(e.target.value)))} /></Field>
              <Field label="Inventory status"><input value={draft.stock < 1 ? "Out of stock" : draft.stock < 5 ? "Low stock" : "Healthy"} disabled /></Field>
              <Field label="Reorder level"><input value="Manage in Inventory" disabled /></Field>
              <Field label="Reorder quantity"><input value="Manage in Inventory" disabled /></Field>
              <p className="lg:col-span-2 rounded-2xl bg-[#eef1e4] p-4 text-xs leading-6 text-black/55">Stock itself belongs to the product master; reorder rules and movement history remain in Inventory so stock changes are auditable.</p>
            </>}

            {tab === "Content" && <div className="lg:col-span-2 space-y-4">
              <Field label="Short description"><input value={draft.short_description || ""} onChange={(e) => setField("short_description", e.target.value)} /></Field>
              <Field label="Product personality line"><input value={draft.personality_line || ""} onChange={(e) => setField("personality_line", e.target.value)} placeholder="A little wild. Very at home." /></Field>
              <Field label="Full description"><textarea rows={6} value={draft.description} onChange={(e) => setField("description", e.target.value)} /></Field>
              <div><label className="mb-2 block text-sm font-semibold">Plant care / detail rows</label><textarea rows={8} value={(draft.details || []).map((row) => `${row[0] || ""} | ${row[1] || ""}`).join("\n")} onChange={(e) => setField("details", e.target.value.split("\n").map((line) => { const [label, ...rest] = line.split("|"); return [label?.trim() || "", rest.join("|").trim()]; }).filter((row) => row[0] || row[1]))} className="min-h-40 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 py-3 text-sm leading-7 outline-none" placeholder="Light | Bright, indirect light\nWater | Let the top soil dry" /></div>
            </div>}

            {tab === "Images" && <div className="lg:col-span-2 space-y-5">
              <Field label="Primary image URL"><input value={draft.image_url || ""} onChange={(e) => setField("image_url", e.target.value)} placeholder="https://…/jade-plant.png" /></Field>
              <Field label="Gallery image URLs (one per line)"><textarea rows={6} value={(draft.image_urls || []).join("\n")} onChange={(e) => setField("image_urls", e.target.value.split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 8))} /></Field>
              <Field label="Primary image alt text"><input value={draft.image_alt_text || ""} onChange={(e) => setField("image_alt_text", e.target.value)} placeholder={`Exact product image — ${draft.name}`} /></Field>
              <Field label="Gallery alt text (one per line)"><textarea rows={4} value={(draft.image_alt_texts || []).join("\n")} onChange={(e) => setField("image_alt_texts", e.target.value.split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 8))} /></Field>
              <div className={`rounded-2xl p-4 text-xs ${draft.image_url && draft.slug && decodeURI(draft.image_url).toLowerCase().includes(`${draft.slug}.png`) ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}><strong>Exact-image check:</strong> {draft.image_url ? (decodeURI(draft.image_url).toLowerCase().includes(`${draft.slug}.png`) ? "Primary image filename matches the product slug." : `Primary image should normally be named ${draft.slug}.png.`) : "Add the exact SKU image before publishing."}</div>
            </div>}

            {tab === "Merchandising" && <>
              <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={Boolean(draft.featured)} onChange={(e) => setField("featured", e.target.checked)} /> Most Loved / featured</label>
              <Field label="Badge"><input value={draft.badge_text || ""} onChange={(e) => setField("badge_text", e.target.value)} /></Field>
              <Field label="Sort order"><input type="number" min="0" value={draft.sort_order || 0} onChange={(e) => setField("sort_order", Math.max(0, Number(e.target.value)))} /></Field>
              <div className="lg:col-span-2"><label className="mb-2 block text-sm font-semibold">Related product slugs <span className="font-normal text-black/40">comma separated, order matters</span></label><input value={arr(draft.related_product_slugs)} onChange={(e) => setField("related_product_slugs", parseSlugs(e.target.value))} placeholder="snake-plant, jade-plant, monstera-deliciosa" /></div>
              <div className="lg:col-span-2"><label className="mb-2 block text-sm font-semibold">Complete the corner slugs <span className="font-normal text-black/40">comma separated, order matters</span></label><input value={arr(draft.complete_corner_slugs)} onChange={(e) => setField("complete_corner_slugs", parseSlugs(e.target.value))} placeholder="ivory-ceramic-pot, premium-potting-mix" /></div>
            </>}

            {tab === "SEO" && <>
              <Field label="SEO title"><input value={draft.seo_title || ""} onChange={(e) => setField("seo_title", e.target.value)} /></Field>
              <Field label="Canonical slug"><input value={draft.canonical_slug || draft.slug} onChange={(e) => setField("canonical_slug", slugify(e.target.value))} /></Field>
              <div className="lg:col-span-2"><Field label="Meta description"><textarea rows={5} value={draft.seo_description || ""} onChange={(e) => setField("seo_description", e.target.value)} /></Field></div>
            </>}

            {tab === "Publishing" && <>
              <Field label="Publish status"><select value={draft.publish_status || (draft.active ? "published" : "draft")} onChange={(e) => setField("publish_status", e.target.value as Product["publish_status"])}><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select></Field>
              <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={Boolean(draft.preview_enabled)} onChange={(e) => setField("preview_enabled", e.target.checked)} /> Enable preview workflow</label>
              <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={Boolean(draft.active)} onChange={(e) => setField("active", e.target.checked)} /> Storefront visible</label>
              <p className="lg:col-span-2 rounded-2xl bg-[#eef1e4] p-4 text-xs leading-6 text-black/55">Published + visible is the live state. Draft/archived records remain in the CMS for editing and recovery.</p>
            </>}
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-black/8 pt-5">
            <span className="text-xs text-black/45">Changes save to the same product record used by the storefront APIs.</span>
            <button type="button" onClick={save} disabled={saving} className="rounded-full bg-[#202d20] px-6 py-3 text-sm font-bold text-[#f4f5e9] disabled:opacity-50">{saving ? "Saving…" : "Save product master"}</button>
          </div>
          {notice && <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
          {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        </>}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold"><span className="mb-2 block">{label}</span>{children}</label>;
}
