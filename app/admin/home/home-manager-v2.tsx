"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type LinkItem = {
  label?: string;
  title?: string;
  eyebrow?: string;
  note?: string;
  href?: string;
  number?: string;
};

type Section = {
  section_key: string;
  content: Record<string, any>;
  active: boolean;
  sort_order: number;
};

const labels: Record<string, string> = {
  hero: "Hero",
  marquee: "Announcement strip",
  collections: "Collections",
  featured: "Featured products",
  story: "Our story",
  care: "Plant care",
  newsletter: "Newsletter",
  footer: "Footer",
};

function TextField({
  label,
  value,
  onChange,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[.16em] text-black/45">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 text-sm outline-none focus:border-black/25"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  className = "min-h-24",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[.16em] text-black/45">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${className} w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 py-3 text-sm outline-none focus:border-black/25`}
      />
    </label>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-[#202d20]" : "bg-black/15"}`}
      aria-label={checked ? "Disable section" : "Enable section"}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`}
      />
    </button>
  );
}

function InputGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function cleanText(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.replace(/\s+/g, " ").trim();
}

function announcementText(item: unknown) {
  if (typeof item === "string") return item === "[object Object]" ? "" : cleanText(item);
  if (item && typeof item === "object") {
    const value = item as Record<string, unknown>;
    for (const key of ["text", "label", "title", "value", "name"]) {
      if (typeof value[key] === "string") return cleanText(value[key]);
    }
  }
  return "";
}

function normalizedAnnouncementItems(content: Record<string, any>) {
  const rawItems = Array.isArray(content.items) ? content.items : [];
  const fromItems = rawItems.map(announcementText).filter(Boolean);
  if (fromItems.length) return [...new Set(fromItems)];

  if (typeof content.text === "string") {
    const fromText = content.text
      .split("·")
      .map((item: string) => cleanText(item))
      .filter(Boolean)
      .filter((item: string) => item !== "[object Object]");
    if (fromText.length) return [...new Set(fromText)];
  }

  return ["PLANT MORE JOY"];
}

function normalizeSection(section: Section): Section {
  const content = { ...(section.content || {}) };
  if (section.section_key === "marquee") {
    const items = normalizedAnnouncementItems(content);
    content.items = items;
    const sequence = `${items.join(" · ")} ·`;
    content.text = `${sequence} ${sequence}`;
  }
  return { ...section, content };
}

function normalizeSections(input: Section[]) {
  return input
    .map(normalizeSection)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export default function HomeManagerV2() {
  const [sections, setSections] = useState<Section[]>([]);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<string>("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setError("");
    const response = await fetch("/api/admin/home", { cache: "no-store" });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || "Unable to load homepage content.");
    const list = Array.isArray(data?.sections) ? (data.sections as Section[]) : [];
    setSections(normalizeSections(list));
    setDirty(new Set());
  }

  useEffect(() => {
    load().catch((errorValue) =>
      setError(errorValue instanceof Error ? errorValue.message : "Unable to load homepage content.")
    );
  }, []);

  const dirtyKeys = useMemo(() => dirty, [dirty]);

  function markDirty(key: string) {
    setDirty((current) => {
      const next = new Set(current);
      next.add(key);
      return next;
    });
    setNotice("");
    setError("");
  }

  function updateSection(key: string, patch: Partial<Section>) {
    setSections((current) =>
      current.map((section) =>
        section.section_key === key ? { ...section, ...patch } : section
      )
    );
    markDirty(key);
  }

  function updateContent(key: string, field: string, value: unknown) {
    setSections((current) =>
      current.map((section) =>
        section.section_key === key
          ? { ...section, content: { ...section.content, [field]: value } }
          : section
      )
    );
    markDirty(key);
  }

  function updateArrayItem(key: string, field: string, index: number, patch: Record<string, unknown>) {
    const section = sections.find((item) => item.section_key === key);
    if (!section) return;
    const items = Array.isArray(section.content[field]) ? [...section.content[field]] : [];
    items[index] = { ...(items[index] || {}), ...patch };
    updateContent(key, field, items);
  }

  function marqueeItems(section: Section) {
    return normalizedAnnouncementItems(section.content);
  }

  function setMarqueeItem(index: number, value: string) {
    const section = sections.find((item) => item.section_key === "marquee");
    if (!section) return;
    const items = marqueeItems(section);
    items[index] = value;
    updateContent("marquee", "items", items);
  }

  function addMarqueeItem() {
    const section = sections.find((item) => item.section_key === "marquee");
    if (!section) return;
    updateContent("marquee", "items", [...marqueeItems(section), "New announcement"]);
  }

  function removeMarqueeItem(index: number) {
    const section = sections.find((item) => item.section_key === "marquee");
    if (!section) return;
    const next = marqueeItems(section).filter((_, itemIndex) => itemIndex !== index);
    updateContent("marquee", "items", next.length ? next : ["PLANT MORE JOY"]);
  }

  function addCollection() {
    const section = sections.find((item) => item.section_key === "collections");
    if (!section) return;
    const items = Array.isArray(section.content.items) ? section.content.items : [];
    updateContent("collections", "items", [
      ...items,
      {
        eyebrow: `${String(items.length + 1).padStart(2, "0")} / NEW`,
        title: "New collection",
        note: "Collection description.",
        href: "/shop",
      },
    ]);
  }

  function addCareItem() {
    const section = sections.find((item) => item.section_key === "care");
    if (!section) return;
    const items = Array.isArray(section.content.items) ? section.content.items : [];
    updateContent("care", "items", [
      ...items,
      {
        number: String(items.length + 1).padStart(2, "0"),
        title: "New care guide",
        href: "/pages/plant-care",
      },
    ]);
  }

  async function save(section: Section) {
    const key = section.section_key;
    if (!dirtyKeys.has(key) || saving) return;

    setSaving(key);
    setNotice("");
    setError("");

    const payload: Record<string, any> = { ...section.content };

    if (key === "marquee") {
      const items = normalizedAnnouncementItems(payload);
      payload.items = items;
      const sequence = `${items.join(" · ")} ·`;
      payload.text = `${sequence} ${sequence}`;
    }

    const response = await fetch("/api/admin/home", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section_key: key,
        content: payload,
        active: section.active,
        sort_order: section.sort_order,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setError(data?.error || `Unable to save ${labels[key] || key}.`);
      setSaving("");
      return;
    }

    setSections((current) =>
      current.map((item) => (item.section_key === key ? { ...item, content: payload } : item))
    );
    setDirty((current) => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });
    setNotice(`${labels[key] || key} saved.`);
    setSaving("");
  }

  const saveButtonClass = (isDirty: boolean) =>
    isDirty
      ? "bg-[#202d20] text-[#f4f5e9] shadow-[0_8px_22px_rgba(32,45,32,.16)]"
      : "bg-black/8 text-black/45";

  return (
    <div className="mt-9 space-y-5">
      {notice && (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </p>
      )}
      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {sections.map((section) => {
        const isDirty = dirtyKeys.has(section.section_key);
        const isSaving = saving === section.section_key;

        return (
          <article
            key={section.section_key}
            className="rounded-3xl border border-black/10 bg-white/60 p-5 sm:p-7"
          >
            <div className="flex flex-col gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black tracking-[.18em] text-[#315233]">SECTION</p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {labels[section.section_key] || section.section_key}
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-black/50">
                  {section.active ? "Visible" : "Hidden"}
                </span>
                <Toggle
                  checked={section.active}
                  onChange={(value) => updateSection(section.section_key, { active: value })}
                />
                <button
                  type="button"
                  onClick={() => void save(section)}
                  disabled={!isDirty || !!saving}
                  className={`rounded-full px-5 py-2.5 text-xs font-bold transition ${saveButtonClass(isDirty)} disabled:cursor-default`}
                >
                  {isSaving ? "Saving…" : isDirty ? "Save changes" : "Saved"}
                </button>
              </div>
            </div>

            {section.section_key === "hero" && (
              <div className="mt-6 space-y-4">
                <InputGrid>
                  <TextField label="Eyebrow" value={section.content.eyebrow || ""} onChange={(value) => updateContent("hero", "eyebrow", value)} />
                  <TextField label="Title" value={section.content.title || ""} onChange={(value) => updateContent("hero", "title", value)} />
                  <TextField label="Emphasized title" value={section.content.emphasized_title || ""} onChange={(value) => updateContent("hero", "emphasized_title", value)} />
                  <TextField label="Primary button" value={section.content.primary_label || ""} onChange={(value) => updateContent("hero", "primary_label", value)} />
                  <TextField label="Primary link" value={section.content.primary_href || ""} onChange={(value) => updateContent("hero", "primary_href", value)} />
                  <TextField label="Secondary button" value={section.content.secondary_label || ""} onChange={(value) => updateContent("hero", "secondary_label", value)} />
                  <TextField label="Secondary link" value={section.content.secondary_href || ""} onChange={(value) => updateContent("hero", "secondary_href", value)} />
                </InputGrid>
                <TextAreaField label="Description" value={section.content.description || ""} onChange={(value) => updateContent("hero", "description", value)} />
              </div>
            )}

            {section.section_key === "marquee" && (
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold">Continuous announcement flow</p>
                  <p className="mt-1 text-xs leading-5 text-black/50">
                    Add as many messages as needed. They will run continuously across the same strip in one seamless loop.
                  </p>
                </div>
                {marqueeItems(section).map((item, index) => (
                  <div key={`marquee-${index}`} className="flex items-end gap-2">
                    <div className="min-w-0 flex-1">
                      <TextField label={`Announcement ${index + 1}`} value={item} onChange={(value) => setMarqueeItem(index, value)} />
                    </div>
                    {marqueeItems(section).length > 1 && (
                      <button type="button" onClick={() => removeMarqueeItem(index)} className="mb-0.5 rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-600">
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addMarqueeItem} className="rounded-full border border-black/15 px-4 py-2 text-xs font-bold">
                  + Add announcement
                </button>
              </div>
            )}

            {section.section_key === "collections" && (
              <div className="mt-6 space-y-5">
                <InputGrid>
                  <TextField label="Eyebrow" value={section.content.eyebrow || ""} onChange={(value) => updateContent("collections", "eyebrow", value)} />
                  <TextField label="Heading" value={section.content.title || ""} onChange={(value) => updateContent("collections", "title", value)} />
                  <TextField label="Emphasized heading" value={section.content.emphasized_title || ""} onChange={(value) => updateContent("collections", "emphasized_title", value)} />
                </InputGrid>
                <TextAreaField label="Intro" value={section.content.description || ""} onChange={(value) => updateContent("collections", "description", value)} className="min-h-20" />
                {(section.content.items || []).map((item: LinkItem, index: number) => (
                  <div key={`collection-${index}`} className="rounded-2xl bg-[#f4f5e9] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <strong className="text-sm">Collection {index + 1}</strong>
                      <button type="button" onClick={() => updateContent("collections", "items", (section.content.items || []).filter((_: unknown, itemIndex: number) => itemIndex !== index))} className="text-xs font-bold text-red-600">
                        Remove
                      </button>
                    </div>
                    <InputGrid>
                      <TextField label="Eyebrow" value={item.eyebrow || ""} onChange={(value) => updateArrayItem("collections", "items", index, { eyebrow: value })} />
                      <TextField label="Title" value={item.title || ""} onChange={(value) => updateArrayItem("collections", "items", index, { title: value })} />
                      <TextField label="Note" value={item.note || ""} onChange={(value) => updateArrayItem("collections", "items", index, { note: value })} />
                      <TextField label="Link" value={item.href || ""} onChange={(value) => updateArrayItem("collections", "items", index, { href: value })} />
                    </InputGrid>
                  </div>
                ))}
                <button type="button" onClick={addCollection} className="rounded-full border border-black/15 px-4 py-2 text-xs font-bold">
                  + Add collection
                </button>
              </div>
            )}

            {section.section_key === "featured" && (
              <div className="mt-6">
                <InputGrid>
                  <TextField label="Eyebrow" value={section.content.eyebrow || ""} onChange={(value) => updateContent("featured", "eyebrow", value)} />
                  <TextField label="Heading" value={section.content.title || ""} onChange={(value) => updateContent("featured", "title", value)} />
                  <TextField label="Emphasized heading" value={section.content.emphasized_title || ""} onChange={(value) => updateContent("featured", "emphasized_title", value)} />
                  <TextField label="Products link label" value={section.content.link_label || ""} onChange={(value) => updateContent("featured", "link_label", value)} />
                  <TextField label="Products link" value={section.content.link_href || ""} onChange={(value) => updateContent("featured", "link_href", value)} />
                  <TextField label="Product badge" value={section.content.badge || ""} onChange={(value) => updateContent("featured", "badge", value)} />
                </InputGrid>
              </div>
            )}

            {section.section_key === "story" && (
              <div className="mt-6 space-y-4">
                <InputGrid>
                  <TextField label="Eyebrow" value={section.content.eyebrow || ""} onChange={(value) => updateContent("story", "eyebrow", value)} />
                  <TextField label="Title" value={section.content.title || ""} onChange={(value) => updateContent("story", "title", value)} />
                  <TextField label="Emphasized title" value={section.content.emphasized_title || ""} onChange={(value) => updateContent("story", "emphasized_title", value)} />
                  <TextField label="Button label" value={section.content.button_label || ""} onChange={(value) => updateContent("story", "button_label", value)} />
                  <TextField label="Button link" value={section.content.button_href || ""} onChange={(value) => updateContent("story", "button_href", value)} />
                  <TextField label="Established" value={section.content.established || ""} onChange={(value) => updateContent("story", "established", value)} />
                </InputGrid>
                <TextAreaField label="Story body" value={section.content.body || ""} onChange={(value) => updateContent("story", "body", value)} />
                <TextField label="Story card line" value={section.content.card_line || ""} onChange={(value) => updateContent("story", "card_line", value)} />
              </div>
            )}

            {section.section_key === "care" && (
              <div className="mt-6 space-y-5">
                <InputGrid>
                  <TextField label="Eyebrow" value={section.content.eyebrow || ""} onChange={(value) => updateContent("care", "eyebrow", value)} />
                  <TextField label="Heading" value={section.content.title || ""} onChange={(value) => updateContent("care", "title", value)} />
                  <TextField label="Emphasized heading" value={section.content.emphasized_title || ""} onChange={(value) => updateContent("care", "emphasized_title", value)} />
                </InputGrid>
                <TextAreaField label="Description" value={section.content.description || ""} onChange={(value) => updateContent("care", "description", value)} className="min-h-20" />
                {(section.content.items || []).map((item: LinkItem, index: number) => (
                  <div key={`care-${index}`} className="rounded-2xl bg-[#f4f5e9] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <strong className="text-sm">Care item {index + 1}</strong>
                      <button type="button" onClick={() => updateContent("care", "items", (section.content.items || []).filter((_: unknown, itemIndex: number) => itemIndex !== index))} className="text-xs font-bold text-red-600">
                        Remove
                      </button>
                    </div>
                    <InputGrid>
                      <TextField label="Number" value={item.number || ""} onChange={(value) => updateArrayItem("care", "items", index, { number: value })} />
                      <TextField label="Title" value={item.title || ""} onChange={(value) => updateArrayItem("care", "items", index, { title: value })} />
                      <TextField label="Link" value={item.href || ""} onChange={(value) => updateArrayItem("care", "items", index, { href: value })} />
                    </InputGrid>
                  </div>
                ))}
                <button type="button" onClick={addCareItem} className="rounded-full border border-black/15 px-4 py-2 text-xs font-bold">
                  + Add care item
                </button>
              </div>
            )}

            {section.section_key === "newsletter" && (
              <div className="mt-6">
                <InputGrid>
                  <TextField label="Eyebrow" value={section.content.eyebrow || ""} onChange={(value) => updateContent("newsletter", "eyebrow", value)} />
                  <TextField label="Title" value={section.content.title || ""} onChange={(value) => updateContent("newsletter", "title", value)} />
                  <TextField label="Emphasized title" value={section.content.emphasized_title || ""} onChange={(value) => updateContent("newsletter", "emphasized_title", value)} />
                  <TextField label="Button label" value={section.content.button_label || ""} onChange={(value) => updateContent("newsletter", "button_label", value)} />
                  <TextField label="Input placeholder" value={section.content.placeholder || ""} onChange={(value) => updateContent("newsletter", "placeholder", value)} />
                </InputGrid>
                <div className="mt-4">
                  <TextAreaField label="Description" value={section.content.description || ""} onChange={(value) => updateContent("newsletter", "description", value)} className="min-h-20" />
                </div>
              </div>
            )}

            {section.section_key === "footer" && (
              <div className="mt-6 space-y-5">
                <TextAreaField label="Description" value={section.content.description || ""} onChange={(value) => updateContent("footer", "description", value)} className="min-h-20" />
                <InputGrid>
                  <TextField label="Copyright" value={section.content.copyright || ""} onChange={(value) => updateContent("footer", "copyright", value)} />
                  <TextField label="Tagline" value={section.content.tagline || ""} onChange={(value) => updateContent("footer", "tagline", value)} />
                </InputGrid>
                <div>
                  <p className="mb-3 text-sm font-semibold">Shop links</p>
                  <div className="space-y-3">
                    {(section.content.shop_links || []).map((item: LinkItem, index: number) => (
                      <div key={`shop-link-${index}`} className="rounded-2xl bg-[#f4f5e9] p-4">
                        <InputGrid>
                          <TextField label="Label" value={item.label || ""} onChange={(value) => updateArrayItem("footer", "shop_links", index, { label: value })} />
                          <TextField label="Link" value={item.href || ""} onChange={(value) => updateArrayItem("footer", "shop_links", index, { href: value })} />
                        </InputGrid>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-sm font-semibold">About links</p>
                  <div className="space-y-3">
                    {(section.content.about_links || []).map((item: LinkItem, index: number) => (
                      <div key={`about-link-${index}`} className="rounded-2xl bg-[#f4f5e9] p-4">
                        <InputGrid>
                          <TextField label="Label" value={item.label || ""} onChange={(value) => updateArrayItem("footer", "about_links", index, { label: value })} />
                          <TextField label="Link" value={item.href || ""} onChange={(value) => updateArrayItem("footer", "about_links", index, { href: value })} />
                        </InputGrid>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
