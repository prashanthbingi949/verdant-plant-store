"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type LinkItem = { label?: string; title?: string; eyebrow?: string; note?: string; href?: string; number?: string };
type Section = { section_key: string; content: Record<string, any>; active: boolean; sort_order: number };

const labels: Record<string, string> = {
  hero: "Hero", marquee: "Announcement strip", collections: "Collections", featured: "Featured products", story: "Our story", care: "Plant care", newsletter: "Newsletter", footer: "Footer",
};

function TextField({ label, value, onChange, placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <label className="block"><span className="mb-1.5 block text-[10px] font-black uppercase tracking-[.16em] text-black/45">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-11 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 text-sm outline-none focus:border-black/25" /></label>;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return <button type="button" onClick={() => onChange(!checked)} className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-[#202d20]" : "bg-black/15"}`} aria-label={checked ? "Disable section" : "Enable section"}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} /></button>;
}

function InputGrid({ children }: { children: ReactNode }) { return <div className="grid gap-4 md:grid-cols-2">{children}</div>; }

export default function HomeManager() {
  const [sections, setSections] = useState<Section[]>([]);
  const [saving, setSaving] = useState<string>("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setError("");
    const response = await fetch("/api/admin/home", { cache: "no-store" });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || "Unable to load homepage content.");
    const list = Array.isArray(data?.sections) ? data.sections as Section[] : [];
    setSections([...list].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
  }

  useEffect(() => { load().catch((e) => setError(e instanceof Error ? e.message : "Unable to load homepage content.")); }, []);

  function updateSection(key: string, patch: Partial<Section>) {
    setSections((current) => current.map((s) => s.section_key === key ? { ...s, ...patch } : s));
  }

  function updateContent(key: string, field: string, value: unknown) {
    setSections((current) => current.map((s) => s.section_key === key ? { ...s, content: { ...s.content, [field]: value } } : s));
  }

  function updateArrayItem(key: string, field: string, index: number, patch: Record<string, unknown>) {
    const section = sections.find((s) => s.section_key === key);
    if (!section) return;
    const items = Array.isArray(section.content[field]) ? [...section.content[field]] : [];
    items[index] = { ...(items[index] || {}), ...patch };
    updateContent(key, field, items);
  }

  async function save(section: Section) {
    setSaving(section.section_key); setNotice(""); setError("");
    const payload = { ...section.content };
    if (section.section_key === "marquee") {
      const items = Array.isArray(payload.items) ? payload.items.map((item: unknown) => String(item || "").trim()).filter(Boolean) : [];
      payload.items = items.length ? items : ["PLANT MORE JOY"];
      const sequence = `${payload.items.join(" · ")} ·`;
      payload.text = `${sequence} ${sequence} ${sequence}`;
    }
    const response = await fetch("/api/admin/home", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section_key: section.section_key, content: payload, active: section.active, sort_order: section.sort_order }) });
    const data = await response.json().catch(() => null);
    if (!response.ok) setError(data?.error || `Unable to save ${labels[section.section_key] || section.section_key}.`);
    else { setNotice(`${labels[section.section_key] || section.section_key} saved.`); setSections((current) => current.map((s) => s.section_key === section.section_key ? { ...s, content: payload } : s)); }
    setSaving("");
  }

  function marqueeItems(section: Section) {
    const items = Array.isArray(section.content.items) ? section.content.items.map((item: unknown) => String(item || "").trim()).filter(Boolean) : [];
    if (items.length) return items;
    if (typeof section.content.text === "string") {
      const parsed = section.content.text.split("·").map((item: string) => item.trim()).filter(Boolean);
      if (parsed.length) return [...new Set(parsed)];
    }
    return ["PLANT MORE JOY"];
  }

  function setMarqueeItem(index: number, value: string) {
    const section = sections.find((s) => s.section_key === "marquee"); if (!section) return;
    const items = marqueeItems(section); items[index] = value; updateContent("marquee", "items", items);
  }

  function addMarqueeItem() {
    const section = sections.find((s) => s.section_key === "marquee"); if (!section) return;
    updateContent("marquee", "items", [...marqueeItems(section), "New announcement"]);
  }

  function removeMarqueeItem(index: number) {
    const section = sections.find((s) => s.section_key === "marquee"); if (!section) return;
    const next = marqueeItems(section).filter((_: string, i: number) => i !== index);
    updateContent("marquee", "items", next.length ? next : ["PLANT MORE JOY"]);
  }

  function addCollection() {
    const section = sections.find((s) => s.section_key === "collections"); if (!section) return;
    const items = Array.isArray(section.content.items) ? section.content.items : [];
    updateContent("collections", "items", [...items, { eyebrow: `${String(items.length + 1).padStart(2, "0")} / NEW`, title: "New collection", note: "Collection description.", href: "/shop" }]);
  }

  function addCareItem() {
    const section = sections.find((s) => s.section_key === "care"); if (!section) return;
    const items = Array.isArray(section.content.items) ? section.content.items : [];
    updateContent("care", "items", [...items, { number: String(items.length + 1).padStart(2, "0"), title: "New care guide", href: "/pages/plant-care" }]);
  }

  return <div className="mt-9 space-y-5">
    {notice && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
    {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    {sections.map((section) => <article key={section.section_key} className="rounded-3xl border border-black/10 bg-white/60 p-5 sm:p-7">
      <div className="flex flex-col gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black tracking-[.18em] text-[#315233]">SECTION</p><h2 className="mt-1 text-2xl font-semibold">{labels[section.section_key] || section.section_key}</h2></div><div className="flex items-center gap-4"><span className="text-xs font-semibold text-black/50">{section.active ? "Visible" : "Hidden"}</span><Toggle checked={section.active} onChange={(v) => updateSection(section.section_key, { active: v })} /><button type="button" onClick={() => save(section)} disabled={saving === section.section_key} className="rounded-full bg-[#202d20] px-5 py-2.5 text-xs font-bold text-[#f4f5e9] disabled:opacity-50">{saving === section.section_key ? "Saving…" : "Save changes"}</button></div></div>

      {section.section_key === "hero" && <div className="mt-6 space-y-4"><InputGrid><TextField label="Eyebrow" value={section.content.eyebrow || ""} onChange={(v) => updateContent("hero", "eyebrow", v)} /><TextField label="Title" value={section.content.title || ""} onChange={(v) => updateContent("hero", "title", v)} /><TextField label="Emphasized title" value={section.content.emphasized_title || ""} onChange={(v) => updateContent("hero", "emphasized_title", v)} /><TextField label="Primary button" value={section.content.primary_label || ""} onChange={(v) => updateContent("hero", "primary_label", v)} /><TextField label="Primary link" value={section.content.primary_href || ""} onChange={(v) => updateContent("hero", "primary_href", v)} /><TextField label="Secondary button" value={section.content.secondary_label || ""} onChange={(v) => updateContent("hero", "secondary_label", v)} /><TextField label="Secondary link" value={section.content.secondary_href || ""} onChange={(v) => updateContent("hero", "secondary_href", v)} /></InputGrid><label className="block"><span className="mb-1.5 block text-[10px] font-black uppercase tracking-[.16em] text-black/45">Description</span><textarea value={section.content.description || ""} onChange={(e) => updateContent("hero", "description", e.target.value)} className="min-h-24 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 py-3 text-sm outline-none" /></label></div>}

      {section.section_key === "marquee" && <div className="mt-6 space-y-4"><div><p className="text-sm font-semibold">Continuous announcement flow</p><p className="mt-1 text-xs leading-5 text-black/50">Add as many messages as needed. They will run continuously across the same strip in one seamless loop.</p></div>{marqueeItems(section).map((item: string, i: number) => <div key={`marquee-${i}`} className="flex items-end gap-2"><div className="min-w-0 flex-1"><TextField label={`Announcement ${i + 1}`} value={item} onChange={(v) => setMarqueeItem(i, v)} /></div>{marqueeItems(section).length > 1 && <button type="button" onClick={() => removeMarqueeItem(i)} className="mb-0.5 rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-600">Remove</button>}</div>)}<button type="button" onClick={addMarqueeItem} className="rounded-full border border-black/15 px-4 py-2 text-xs font-bold">+ Add announcement</button></div>}

      {section.section_key === "collections" && <div className="mt-6 space-y-5"><InputGrid><TextField label="Eyebrow" value={section.content.eyebrow || ""} onChange={(v) => updateContent("collections", "eyebrow", v)} /><TextField label="Heading" value={section.content.title || ""} onChange={(v) => updateContent("collections", "title", v)} /><TextField label="Emphasized heading" value={section.content.emphasized_title || ""} onChange={(v) => updateContent("collections", "emphasized_title", v)} /></InputGrid><label className="block"><span className="mb-1.5 block text-[10px] font-black uppercase tracking-[.16em] text-black/45">Intro</span><textarea value={section.content.description || ""} onChange={(e) => updateContent("collections", "description", e.target.value)} className="min-h-20 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 py-3 text-sm outline-none" /></label>{(section.content.items || []).map((item: LinkItem, i: number) => <div key={`collection-${i}`} className="rounded-2xl bg-[#f4f5e9] p-4"><div className="mb-3 flex items-center justify-between"><strong className="text-sm">Collection {i + 1}</strong><button type="button" onClick={() => updateContent("collections", "items", (section.content.items || []).filter((_: unknown, index: number) => index !== i))} className="text-xs font-bold text-red-600">Remove</button></div><InputGrid><TextField label="Eyebrow" value={item.eyebrow || ""} onChange={(v) => updateArrayItem("collections", "items", i, { eyebrow: v })} /><TextField label="Title" value={item.title || ""} onChange={(v) => updateArrayItem("collections", "items", i, { title: v })} /><TextField label="Note" value={item.note || ""} onChange={(v) => updateArrayItem("collections", "items", i, { note: v })} /><TextField label="Link" value={item.href || ""} onChange={(v) => updateArrayItem("collections", "items", i, { href: v })} /></InputGrid></div>)}<button type="button" onClick={addCollection} className="rounded-full border border-black/15 px-4 py-2 text-xs font-bold">+ Add collection</button></div>}

      {section.section_key === "featured" && <div className="mt-6"><InputGrid><TextField label="Eyebrow" value={section.content.eyebrow || ""} onChange={(v) => updateContent("featured", "eyebrow", v)} /><TextField label="Heading" value={section.content.title || ""} onChange={(v) => updateContent("featured", "title", v)} /><TextField label="Emphasized heading" value={section.content.emphasized_title || ""} onChange={(v) => updateContent("featured", "emphasized_title", v)} /><TextField label="Products link label" value={section.content.link_label || ""} onChange={(v) => updateContent("featured", "link_label", v)} /><TextField label="Products link" value={section.content.link_href || ""} onChange={(v) => updateContent("featured", "link_href", v)} /><TextField label="Product badge" value={section.content.badge || ""} onChange={(v) => updateContent("featured", "badge", v)} /></InputGrid></div>}

      {section.section_key === "story" && <div className="mt-6 space-y-4"><InputGrid><TextField label="Eyebrow" value={section.content.eyebrow || ""} onChange={(v) => updateContent("story", "eyebrow", v)} /><TextField label="Title" value={section.content.title || ""} onChange={(v) => updateContent("story", "title", v)} /><TextField label="Emphasized title" value={section.content.emphasized_title || ""} onChange={(v) => updateContent("story", "emphasized_title", v)} /><TextField label="Button label" value={section.content.button_label || ""} onChange={(v) => updateContent("story", "button_label", v)} /><TextField label="Button link" value={section.content.button_href || ""} onChange={(v) => updateContent("story", "button_href", v)} /><TextField label="Established" value={section.content.established || ""} onChange={(v) => updateContent("story", "established", v)} /></InputGrid><label className="block"><span className="mb-1.5 block text-[10px] font-black uppercase tracking-[.16em] text-black/45">Story body</span><textarea value={section.content.body || ""} onChange={(e) => updateContent("story", "body", e.target.value)} className="min-h-32 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 py-3 text-sm outline-none" /></label><TextField label="Card line" value={section.content.card_line || ""} onChange={(v) => updateContent("story", "card_line", v)} /></div>}

      {section.section_key === "care" && <div className="mt-6 space-y-5"><InputGrid><TextField label="Eyebrow" value={section.content.eyebrow || ""} onChange={(v) => updateContent("care", "eyebrow", v)} /><TextField label="Heading" value={section.content.title || ""} onChange={(v) => updateContent("care", "title", v)} /><TextField label="Emphasized heading" value={section.content.emphasized_title || ""} onChange={(v) => updateContent("care", "emphasized_title", v)} /></InputGrid><label className="block"><span className="mb-1.5 block text-[10px] font-black uppercase tracking-[.16em] text-black/45">Description</span><textarea value={section.content.description || ""} onChange={(e) => updateContent("care", "description", e.target.value)} className="min-h-20 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 py-3 text-sm outline-none" /></label>{(section.content.items || []).map((item: LinkItem, i: number) => <div key={`care-${i}`} className="rounded-2xl bg-[#f4f5e9] p-4"><div className="mb-3 flex items-center justify-between"><strong className="text-sm">Care guide {i + 1}</strong><button type="button" onClick={() => updateContent("care", "items", (section.content.items || []).filter((_: unknown, index: number) => index !== i))} className="text-xs font-bold text-red-600">Remove</button></div><InputGrid><TextField label="Number" value={item.number || ""} onChange={(v) => updateArrayItem("care", "items", i, { number: v })} /><TextField label="Title" value={item.title || ""} onChange={(v) => updateArrayItem("care", "items", i, { title: v })} /><TextField label="Link" value={item.href || ""} onChange={(v) => updateArrayItem("care", "items", i, { href: v })} /></InputGrid></div>)}<button type="button" onClick={addCareItem} className="rounded-full border border-black/15 px-4 py-2 text-xs font-bold">+ Add care guide</button></div>}

      {section.section_key === "newsletter" && <div className="mt-6"><InputGrid><TextField label="Eyebrow" value={section.content.eyebrow || ""} onChange={(v) => updateContent("newsletter", "eyebrow", v)} /><TextField label="Heading" value={section.content.title || ""} onChange={(v) => updateContent("newsletter", "title", v)} /><TextField label="Emphasized heading" value={section.content.emphasized_title || ""} onChange={(v) => updateContent("newsletter", "emphasized_title", v)} /><TextField label="Button label" value={section.content.button_label || ""} onChange={(v) => updateContent("newsletter", "button_label", v)} /><TextField label="Input placeholder" value={section.content.placeholder || ""} onChange={(v) => updateContent("newsletter", "placeholder", v)} /><TextField label="Description" value={section.content.description || ""} onChange={(v) => updateContent("newsletter", "description", v)} /></InputGrid></div>}

      {section.section_key === "footer" && <div className="mt-6 space-y-5"><TextField label="Brand description" value={section.content.description || ""} onChange={(v) => updateContent("footer", "description", v)} /><InputGrid><TextField label="Copyright" value={section.content.copyright || ""} onChange={(v) => updateContent("footer", "copyright", v)} /><TextField label="Tagline" value={section.content.tagline || ""} onChange={(v) => updateContent("footer", "tagline", v)} /></InputGrid><div className="grid gap-5 lg:grid-cols-2"><div className="rounded-2xl bg-[#f4f5e9] p-4"><strong className="text-sm">Shop links</strong><div className="mt-3 space-y-2">{(section.content.shop_links || []).map((item: LinkItem, i: number) => <div key={`shop-link-${i}`} className="grid grid-cols-2 gap-2"><input value={item.label || ""} onChange={(e) => updateArrayItem("footer", "shop_links", i, { label: e.target.value })} className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm" placeholder="Label" /><input value={item.href || ""} onChange={(e) => updateArrayItem("footer", "shop_links", i, { href: e.target.value })} className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm" placeholder="Link" /></div>)}</div></div><div className="rounded-2xl bg-[#f4f5e9] p-4"><strong className="text-sm">About links</strong><div className="mt-3 space-y-2">{(section.content.about_links || []).map((item: LinkItem, i: number) => <div key={`about-link-${i}`} className="grid grid-cols-2 gap-2"><input value={item.label || ""} onChange={(e) => updateArrayItem("footer", "about_links", i, { label: e.target.value })} className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm" placeholder="Label" /><input value={item.href || ""} onChange={(e) => updateArrayItem("footer", "about_links", i, { href: e.target.value })} className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm" placeholder="Link" /></div>)}</div></div></div></div>}
    </article>)}
    {!sections.length && !error && <p className="rounded-3xl border border-black/10 bg-white/60 p-7 text-sm text-black/55">Loading homepage controls…</p>}
  </div>;
}