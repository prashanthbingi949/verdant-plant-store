import { NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabase-admin";

const defaultFooter = {
  description: "Thoughtful plants and beautiful objects for a greener everyday.",
  shop_links: [
    { label: "Indoor plants", href: "/shop?category=Indoor%20plants" },
    { label: "Succulents", href: "/shop?category=Succulents" },
    { label: "Planters", href: "/shop?category=Pots%20%26%20Planters" },
    { label: "Plant care", href: "/pages/plant-care" },
  ],
  about_links: [
    { label: "Our story", href: "/#story" },
    { label: "Care journal", href: "/pages/plant-care" },
    { label: "Account", href: "/account" },
    { label: "Contact", href: "/#newsletter" },
  ],
  copyright: "© 2026 VERDANT",
  tagline: "MADE FOR SLOW GROWERS",
};

const defaults = [
  { section_key: "hero", content: { eyebrow: "A GREENER EVERYDAY", title: "Bring home a little", emphasized_title: "wild.", description: "Thoughtful plants and beautiful objects for a greener everyday.", primary_label: "Shop plants", primary_href: "/shop", secondary_label: "Explore the collection", secondary_href: "#collections" }, active: true, sort_order: 10 },
  { section_key: "marquee", content: { items: ["PLANT MORE JOY", "GROW SOMETHING GOOD", "GREEN YOUR EVERYDAY"], text: "PLANT MORE JOY · GROW SOMETHING GOOD · GREEN YOUR EVERYDAY ·" }, active: true, sort_order: 20 },
  { section_key: "collections", content: { eyebrow: "THE VERDANT EDIT", title: "Choose your", emphasized_title: "green.", description: "From first-time plant parents to lifelong gardeners, there is a little something growing here for everyone.", items: [ { eyebrow: "01 / EASY CARE", title: "Indoor plants", note: "Calm, green companions for every room.", href: "/shop?category=Indoor%20plants" }, { eyebrow: "02 / SUN LOVERS", title: "Outdoor plants", note: "Bring a little wildness to balconies and gardens.", href: "/shop?category=Outdoor%20plants" }, { eyebrow: "03 / MINIATURE", title: "Succulents", note: "Small shapes with a lot of personality.", href: "/shop?category=Succulents" } ] }, active: true, sort_order: 30 },
  { section_key: "featured", content: { eyebrow: "MOST LOVED", title: "Little", emphasized_title: "legends.", link_label: "View all plants", link_href: "/shop", badge: "BEST SELLER" }, active: true, sort_order: 40 },
  { section_key: "story", content: { eyebrow: "THE VERDANT WAY", title: "More than a store.", emphasized_title: "A little ritual.", body: "We believe plants change a room, then slowly change the way the room feels. Verdant is a place for that transformation — one stem, one pot, one sunny corner at a time.", button_label: "Explore plant care", button_href: "#care", established: "EST. 2026", card_line: "Good things take root." }, active: true, sort_order: 50 },
  { section_key: "care", content: { eyebrow: "PLANT CARE, MADE SIMPLE", title: "Less guesswork.", emphasized_title: "More growing.", description: "Practical guides for water, light, soil and everything in between.", items: [ { number: "01", title: "Watering without overthinking", href: "/pages/plant-care" }, { number: "02", title: "Finding the right light", href: "/pages/plant-care" }, { number: "03", title: "Repotting, root to leaf", href: "/pages/plant-care" }, { number: "04", title: "Build your own green corner", href: "/pages/plant-care" } ] }, active: true, sort_order: 60 },
  { section_key: "newsletter", content: { eyebrow: "A NOTE FROM VERDANT", title: "Grow slowly.", emphasized_title: "Stay curious.", description: "Plant tips, new arrivals and good things — occasionally.", button_label: "Join us", placeholder: "Your email address" }, active: true, sort_order: 70 },
  { section_key: "footer", content: defaultFooter, active: true, sort_order: 80 },
];

function normalizeMarquee(section: { section_key: string; content: Record<string, any>; active: boolean; sort_order: number }) {
  if (section.section_key !== "marquee") return section;
  const content = section.content || {};
  const rawItems = Array.isArray(content.items)
    ? content.items.map((item: unknown) => String(item || "").trim()).filter(Boolean)
    : [];
  let items = rawItems;
  if (!items.length && typeof content.text === "string") {
    items = content.text.split("·").map((item: string) => item.trim()).filter(Boolean);
  }
  if (!items.length) items = ["PLANT MORE JOY"];
  const sequence = `${items.join(" · ")} ·`;
  return { ...section, content: { ...content, items, text: `${sequence} ${sequence}` } };
}

function mergeSection(row: any) {
  const fallback = defaults.find((item) => item.section_key === row.section_key);
  const merged = { ...(fallback || {}), ...row, content: { ...(fallback?.content || {}), ...(row.content || {}) } };
  if (merged.section_key === "marquee") return normalizeMarquee(merged);
  if (merged.section_key === "care" && (!Array.isArray(merged.content.items) || !merged.content.items.length)) {
    merged.content.items = fallback?.content.items || [];
  }
  if (merged.section_key === "footer") {
    merged.content = { ...defaultFooter, ...merged.content };
    if (!Array.isArray(merged.content.shop_links) || !merged.content.shop_links.length) merged.content.shop_links = defaultFooter.shop_links;
    if (!Array.isArray(merged.content.about_links) || !merged.content.about_links.length) merged.content.about_links = defaultFooter.about_links;
  }
  return merged;
}

export async function GET() {
  const result = await supabaseSelect("home_content", "select=*&order=sort_order.asc");
  if (!result.configured || !result.response?.ok) return NextResponse.json({ sections: defaults.map(mergeSection) });
  const rows = Array.isArray(result.data) ? result.data : [];
  const byKey = new Map(rows.map((row: any) => [String(row.section_key), row]));
  const merged = defaults.map((fallback) => mergeSection(byKey.get(fallback.section_key) || fallback));
  for (const row of rows as any[]) {
    if (!defaults.some((fallback) => fallback.section_key === row.section_key)) merged.push(mergeSection(row));
  }
  return NextResponse.json({ sections: merged.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) });
}
