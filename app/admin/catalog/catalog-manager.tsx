"use client";

import { useEffect, useMemo, useState } from "react";

type Category = { id: string; product_type: "Plants" | "Gardening Supplies"; name: string; slug: string; description: string; image_url?: string | null; active: boolean; sort_order: number };
type Subcategory = { id: string; category_id: string; name: string; slug: string; description: string; image_url?: string | null; active: boolean; sort_order: number };

export default function CatalogManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subs, setSubs] = useState<Subcategory[]>([]);
  const [type, setType] = useState<"Plants" | "Gardening Supplies">("Plants");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [newSub, setNewSub] = useState<Record<string, string>>({});

  async function load() {
    const [a, b] = await Promise.all([
      fetch("/api/admin/catalog/categories", { cache: "no-store" }),
      fetch("/api/admin/catalog/subcategories", { cache: "no-store" }),
    ]);
    const ad = await a.json();
    const bd = await b.json();
    if (!a.ok || !b.ok) throw new Error(ad?.error || bd?.error || "Unable to load catalog.");
    setCategories(Array.isArray(ad.categories) ? ad.categories : []);
    setSubs(Array.isArray(bd.subcategories) ? bd.subcategories : []);
  }

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Unable to load catalog."));
  }, []);

  const visible = useMemo(() => categories.filter((c) => c.product_type === type), [categories, type]);

  async function addCategory() {
    setError("");
    setNotice("");
    if (!name.trim()) {
      setError("Enter a category name.");
      return;
    }
    const response = await fetch("/api/admin/catalog/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_type: type, name, description }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setError(data?.error || "Unable to add category.");
      return;
    }
    setName("");
    setDescription("");
    setNotice("Category added.");
    await load();
  }

  async function addSubcategory(categoryId: string) {
    const value = (newSub[categoryId] || "").trim();
    if (!value) return;
    const response = await fetch("/api/admin/catalog/subcategories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category_id: categoryId, name: value }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setError(data?.error || "Unable to add sub-category.");
      return;
    }
    setNewSub((v) => ({ ...v, [categoryId]: "" }));
    setNotice("Sub-category added.");
    await load();
  }

  async function toggleCategory(category: Category) {
    const response = await fetch("/api/admin/catalog/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: category.id, active: !category.active }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error || "Unable to update category.");
      return;
    }
    await load();
  }

  async function toggleSub(sub: Subcategory) {
    const response = await fetch("/api/admin/catalog/subcategories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sub.id, active: !sub.active }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error || "Unable to update sub-category.");
      return;
    }
    await load();
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <p className="text-[10px] font-black tracking-[.2em] text-[#315233]">CATALOG MANAGER</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-[-.055em] sm:text-6xl">Shape your <em className="font-serif font-normal">shop.</em></h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-black/55">Manage the structure your client will use to organize plants and gardening supplies without editing code.</p>
      {notice && <p className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
      {error && <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-8 flex flex-wrap gap-2">
        <button type="button" onClick={() => setType("Plants")} className={`rounded-full px-5 py-2.5 text-sm font-bold ${type === "Plants" ? "bg-[#202d20] text-[#f4f5e9]" : "bg-black/5"}`}>Plants</button>
        <button type="button" onClick={() => setType("Gardening Supplies")} className={`rounded-full px-5 py-2.5 text-sm font-bold ${type === "Gardening Supplies" ? "bg-[#202d20] text-[#f4f5e9]" : "bg-black/5"}`}>Gardening Supplies</button>
      </div>

      <div className="mt-5 rounded-3xl border border-black/10 bg-white/55 p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Add category</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.4fr_auto]">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={type === "Plants" ? "e.g. Indoor & Decorative Greens" : "e.g. Pots & Planters"} className="h-12 rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 outline-none" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short category description" className="h-12 rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 outline-none" />
          <button type="button" onClick={addCategory} className="rounded-full bg-[#202d20] px-6 py-3 text-sm font-bold text-[#f4f5e9]">Add</button>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {visible.map((category) => {
          const child = subs.filter((s) => s.category_id === category.id);
          return (
            <article key={category.id} className="rounded-3xl border border-black/10 bg-white/55 p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{category.name}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${category.active ? "bg-emerald-100 text-emerald-800" : "bg-black/10 text-black/45"}`}>{category.active ? "Live" : "Hidden"}</span>
                  </div>
                  <p className="mt-1 text-sm text-black/45">/{category.slug} · {child.length} sub-categor{child.length === 1 ? "y" : "ies"}</p>
                  {category.description && <p className="mt-3 text-sm leading-6 text-black/55">{category.description}</p>}
                </div>
                <button type="button" onClick={() => toggleCategory(category)} className="rounded-full border border-black/15 px-4 py-2 text-xs font-bold">{category.active ? "Hide" : "Show"}</button>
              </div>

              <div className="mt-5 space-y-2">
                {child.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between rounded-2xl bg-[#f4f5e9] px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold">{sub.name}</p>
                      <p className="text-xs text-black/40">/{sub.slug}</p>
                    </div>
                    <button type="button" onClick={() => toggleSub(sub)} className="text-xs font-bold text-[#315233]">{sub.active ? "Hide" : "Show"}</button>
                  </div>
                ))}

                <div className="flex gap-2 pt-2">
                  <input value={newSub[category.id] || ""} onChange={(e) => setNewSub((v) => ({ ...v, [category.id]: e.target.value }))} placeholder="Add sub-category" className="h-11 flex-1 rounded-full border border-black/10 bg-[#f4f5e9] px-4 text-sm outline-none" />
                  <button type="button" onClick={() => addSubcategory(category.id)} className="rounded-full bg-[#ddf27a] px-5 py-2 text-sm font-bold text-[#202d20]">Add</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
