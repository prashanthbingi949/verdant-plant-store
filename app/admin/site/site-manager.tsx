"use client";

import { useEffect, useState } from "react";

type Settings = Record<string, Record<string, string>>;
type NavItem = { id: string; label: string; href: string; location: "header" | "footer"; active: boolean; sort_order: number };

function Field({ label, value, onChange, placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <label className="block"><span className="mb-1.5 block text-[10px] font-black uppercase tracking-[.16em] text-black/45">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-11 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 text-sm outline-none focus:border-black/25" /></label>;
}

export default function SiteManager() {
  const [settings, setSettings] = useState<Settings>({ brand: {}, contact: {}, social: {}, store: {} });
  const [navigation, setNavigation] = useState<NavItem[]>([]);
  const [newItem, setNewItem] = useState({ label: "", href: "", location: "header" as "header" | "footer" });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");

  async function load() {
    setError("");
    const response = await fetch("/api/admin/site", { cache: "no-store" });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || "Unable to load site settings.");
    setSettings(data.settings || { brand: {}, contact: {}, social: {}, store: {} });
    setNavigation(Array.isArray(data.navigation) ? data.navigation : []);
  }

  useEffect(() => { load().catch((e) => setError(e instanceof Error ? e.message : "Unable to load site settings.")); }, []);

  function setValue(group: string, field: string, value: string) {
    setSettings((current) => ({ ...current, [group]: { ...(current[group] || {}), [field]: value } }));
  }

  async function saveGroup(group: string) {
    setSaving(group); setNotice(""); setError("");
    const response = await fetch("/api/admin/site", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ site_key: group, value: settings[group] || {} }) });
    const data = await response.json().catch(() => null);
    if (!response.ok) setError(data?.error || `Unable to save ${group}.`); else setNotice(`${group.charAt(0).toUpperCase() + group.slice(1)} settings saved.`);
    setSaving("");
  }

  async function addNavigation() {
    setNotice(""); setError("");
    if (!newItem.label.trim() || !newItem.href.trim()) { setError("Enter both a navigation label and link."); return; }
    const response = await fetch("/api/admin/site", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newItem) });
    const data = await response.json().catch(() => null);
    if (!response.ok) { setError(data?.error || "Unable to add navigation item."); return; }
    setNewItem({ label: "", href: "", location: "header" }); setNotice("Navigation item added."); await load();
  }

  async function updateNavigation(item: NavItem, patch: Partial<NavItem>) {
    const response = await fetch("/api/admin/site", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, ...patch }) });
    if (!response.ok) { const data = await response.json().catch(() => null); setError(data?.error || "Unable to update navigation item."); return; }
    setNavigation((items) => items.map((x) => x.id === item.id ? { ...x, ...patch } : x));
  }

  return <div className="mt-9 space-y-5">
    {notice && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
    {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

    {([
      ["brand", "Brand", [["name", "Brand name"], ["tagline", "Tagline"]]],
      ["contact", "Contact", [["email", "Email"], ["phone", "Phone"], ["address", "Address"]]],
      ["social", "Social links", [["instagram", "Instagram URL"], ["facebook", "Facebook URL"], ["whatsapp", "WhatsApp URL"]]],
      ["store", "Store defaults", [["currency", "Currency"], ["support_note", "Support note"]]],
    ] as const).map(([group, title, fields]) => <section key={group} className="rounded-3xl border border-black/10 bg-white/60 p-5 sm:p-7"><div className="flex flex-col gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black tracking-[.18em] text-[#315233]">SITE SETTING</p><h2 className="mt-1 text-2xl font-semibold">{title}</h2></div><button type="button" onClick={() => saveGroup(group)} disabled={saving === group} className="rounded-full bg-[#202d20] px-5 py-2.5 text-xs font-bold text-[#f4f5e9] disabled:opacity-50">{saving === group ? "Saving…" : "Save changes"}</button></div><div className="mt-6 grid gap-4 md:grid-cols-2">{fields.map(([field, label]) => <Field key={field} label={label} value={settings[group]?.[field] || ""} onChange={(v) => setValue(group, field, v)} />)}</div></section>)}

    <section className="rounded-3xl border border-black/10 bg-white/60 p-5 sm:p-7"><div className="border-b border-black/10 pb-5"><p className="text-[10px] font-black tracking-[.18em] text-[#315233]">NAVIGATION</p><h2 className="mt-1 text-2xl font-semibold">Header & footer links</h2><p className="mt-2 text-sm text-black/50">Add links, change their destinations, move them between header and footer, or hide them.</p></div><div className="mt-6 grid gap-3 md:grid-cols-[1fr_1.4fr_auto_auto]"><input value={newItem.label} onChange={(e) => setNewItem((v) => ({ ...v, label: e.target.value }))} placeholder="Label" className="h-11 rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 text-sm outline-none"/><input value={newItem.href} onChange={(e) => setNewItem((v) => ({ ...v, href: e.target.value }))} placeholder="Link e.g. /shop or #story" className="h-11 rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 text-sm outline-none"/><select value={newItem.location} onChange={(e) => setNewItem((v) => ({ ...v, location: e.target.value as "header" | "footer" }))} className="h-11 rounded-2xl border border-black/10 bg-[#f4f5e9] px-3 text-sm"><option value="header">Header</option><option value="footer">Footer</option></select><button type="button" onClick={addNavigation} className="rounded-full bg-[#ddf27a] px-5 py-2 text-sm font-bold text-[#202d20]">Add</button></div><div className="mt-5 space-y-3">{navigation.map((item) => <div key={item.id} className="grid gap-3 rounded-2xl bg-[#f4f5e9] p-4 md:grid-cols-[1fr_1.4fr_120px_80px]"><input value={item.label} onChange={(e) => setNavigation((items) => items.map((x) => x.id === item.id ? { ...x, label: e.target.value } : x))} onBlur={(e) => updateNavigation(item, { label: e.target.value })} className="h-10 rounded-xl border border-black/10 bg-white/60 px-3 text-sm"/><input value={item.href} onChange={(e) => setNavigation((items) => items.map((x) => x.id === item.id ? { ...x, href: e.target.value } : x))} onBlur={(e) => updateNavigation(item, { href: e.target.value })} className="h-10 rounded-xl border border-black/10 bg-white/60 px-3 text-sm"/><select value={item.location} onChange={(e) => updateNavigation(item, { location: e.target.value as "header" | "footer" })} className="h-10 rounded-xl border border-black/10 bg-white/60 px-3 text-sm"><option value="header">Header</option><option value="footer">Footer</option></select><button type="button" onClick={() => updateNavigation(item, { active: !item.active })} className={`rounded-xl text-xs font-bold ${item.active ? "text-[#315233]" : "text-black/35"}`}>{item.active ? "Visible" : "Hidden"}</button></div>)}</div></section>
  </div>;
}
