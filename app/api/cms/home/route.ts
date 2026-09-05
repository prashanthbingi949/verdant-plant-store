import { NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabase-admin";

const defaults = [
  { section_key: "hero", content: { eyebrow: "A GREENER EVERYDAY", title: "Bring home a little", emphasized_title: "wild.", description: "Thoughtful plants and beautiful objects for a greener everyday.", primary_label: "Shop plants", primary_href: "/shop", secondary_label: "Explore the collection", secondary_href: "#collections" }, active: true, sort_order: 10 },
  { section_key: "marquee", content: { items: ["PLANT MORE JOY", "GROW SOMETHING GOOD", "GREEN YOUR EVERYDAY"], text: "PLANT MORE JOY · GROW SOMETHING GOOD · GREEN YOUR EVERYDAY · PLANT MORE JOY · GROW SOMETHING GOOD · GREEN YOUR EVERYDAY ·" }, active: true, sort_order: 20 },
  { section_key: "collections", content: { eyebrow: "THE VERDANT EDIT", title: "Choose your", emphasized_title: "green.", description: "From first-time plant parents to lifelong gardeners, there is a little something growing here for everyone.", items: [ { eyebrow: "01 / EASY CARE", title: "Indoor plants", note: "Calm, green companions for every room.", href: "/shop" }, { eyebrow: "02 / SUN LOVERS", title: "Outdoor plants", note: "Bring a little wildness to balconies and gardens.", href: "/shop" }, { eyebrow: "03 / MINIATURE", title: "Succulents", note: "Small shapes with a lot of personality.", href: "/shop" } ] }, active: true, sort_order: 30 },
  { section_key: "featured", content: { eyebrow: "MOST LOVED", title: "Little", emphasized_title: "legends.", link_label: "View all plants", link_href: "/shop", badge: "BEST SELLER" }, active: true, sort_order: 40 },
  { section_key: "story", content: { eyebrow: "THE VERDANT WAY", title: "More than a store.", emphasized_title: "A little ritual.", body: "We believe plants change a room, then slowly change the way the room feels. Verdant is a place for that transformation — one stem, one pot, one sunny corner at a time.", button_label: "Explore plant care", button_href: "#care", established: "EST. 2026", card_line: "Good things take root." }, active: true, sort_order: 50 },
  { section_key: "care", content: { eyebrow: "PLANT CARE, MADE SIMPLE", title: "Less guesswork.", emphasized_title: "More growing.", description: "Practical guides for water, light, soil and everything in between.", items: [ { number: "01", title: "Watering without overthinking", href: "#care" }, { number: "02", title: "Finding the right light", href: "#care" }, { number: "03", title: "Repotting, root to leaf", href: "#care" }, { number: "04", title: "Build your own green corner", href: "#care" } ] }, active: true, sort_order: 60 },
  { section_key: "newsletter", content: { eyebrow: "A NOTE FROM VERDANT", title: "Grow slowly.", emphasized_title: "Stay curious.", description: "Plant tips, new arrivals and good things — occasionally.", button_label: "Join us", placeholder: "Your email address" }, active: true, sort_order: 70 },
  { section_key: "footer", content: { description: "Thoughtful plants and beautiful objects for a greener everyday.", shop_links: [ { label: "Indoor plants", href: "/shop" }, { label: "Succulents", href: "/shop" }, { label: "Planters", href: "/shop" }, { label: "Plant care", href: "#care" } ], about_links: [ { label: "Our story", href: "#story" }, { label: "Care journal", href: "#care" }, { label: "Account", href: "/account" }, { label: "Contact", href: "#newsletter" } ], copyright: "© 2026 VERDANT", tagline: "MADE FOR SLOW GROWERS" }, active: true, sort_order: 80 },
];

function normalizeMarquee(section: { section_key: string; content: Record<string, any>; active: boolean; sort_order: number }) {
  if (section.section_key !== "marquee") return section;
  const rawItems = Array.isArray(section.content.items)
    ? section.content.items.map((item: unknown) => String(item || "").trim()).filter(Boolean)
    : [];

  let items = rawItems;
  if (!items.length && typeof section.content.text === "string") {
    items = section.content.text.split("·").map((item: string) => item.trim()).filter(Boolean);
  }
  if (!items.length) items = ["PLANT MORE JOY"];

  const sequence = `${items.join(" · ")} ·`;
  const loopText = `${sequence} ${sequence} ${sequence}`;
  return { ...section, content: { ...section.content, items, text: loopText } };
}

export async function GET() {
  const result = await supabaseSelect("home_content", "select=*&order=sort_order.asc");
  if (!result.configured || !result.response?.ok) return NextResponse.json({ sections: defaults.map(normalizeMarquee) });
  const sections = Array.isArray(result.data) ? result.data : [];
  return NextResponse.json({ sections: (sections.length ? sections : defaults).map(normalizeMarquee) });
}
