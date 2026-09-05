import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isValidAdminToken } from "@/lib/admin-auth";
import { supabaseInsert, supabaseSelect, supabaseUpdate } from "@/lib/supabase-admin";

type HomeSection = {
  section_key: string;
  content: Record<string, unknown>;
  active: boolean;
  sort_order: number;
};

const defaults: HomeSection[] = [
  { section_key: "hero", content: { eyebrow: "A GREENER EVERYDAY", title: "Bring home a little", emphasized_title: "wild.", description: "Thoughtful plants and beautiful objects for a greener everyday.", primary_label: "Shop plants", primary_href: "/shop", secondary_label: "Explore the collection", secondary_href: "#collections" }, active: true, sort_order: 10 },
  { section_key: "marquee", content: { text: "PLANT MORE JOY · PLANT MORE JOY · PLANT MORE JOY · PLANT MORE JOY ·" }, active: true, sort_order: 20 },
  { section_key: "collections", content: { eyebrow: "THE VERDANT EDIT", title: "Choose your", emphasized_title: "green.", description: "From first-time plant parents to lifelong gardeners, there is a little something growing here for everyone.", items: [ { eyebrow: "01 / EASY CARE", title: "Indoor plants", note: "Calm, green companions for every room.", href: "/shop?category=Indoor%20plants" }, { eyebrow: "02 / SUN LOVERS", title: "Outdoor plants", note: "Bring a little wildness to balconies and gardens.", href: "/shop?category=Outdoor%20plants" }, { eyebrow: "03 / MINIATURE", title: "Succulents", note: "Small shapes with a lot of personality.", href: "/shop?category=Succulents" } ] }, active: true, sort_order: 30 },
  { section_key: "featured", content: { eyebrow: "MOST LOVED", title: "Little", emphasized_title: "legends.", link_label: "View all plants", link_href: "/shop", badge: "BEST SELLER" }, active: true, sort_order: 40 },
  { section_key: "story", content: { eyebrow: "THE VERDANT WAY", title: "More than a store.", emphasized_title: "A little ritual.", body: "We believe plants change a room, then slowly change the way the room feels. Verdant is a place for that transformation — one stem, one pot, one sunny corner at a time.", button_label: "Explore plant care", button_href: "#care", established: "EST. 2026", card_line: "Good things take root." }, active: true, sort_order: 50 },
  { section_key: "care", content: { eyebrow: "PLANT CARE, MADE SIMPLE", title: "Less guesswork.", emphasized_title: "More growing.", description: "Practical guides for water, light, soil and everything in between.", items: [ { number: "01", title: "Watering without overthinking", href: "#care" }, { number: "02", title: "Finding the right light", href: "#care" }, { number: "03", title: "Repotting, root to leaf", href: "#care" }, { number: "04", title: "Build your own green corner", href: "#care" } ] }, active: true, sort_order: 60 },
  { section_key: "newsletter", content: { eyebrow: "A NOTE FROM VERDANT", title: "Grow slowly.", emphasized_title: "Stay curious.", description: "Plant tips, new arrivals and good things — occasionally.", button_label: "Join us", placeholder: "Your email address" }, active: true, sort_order: 70 },
  { section_key: "footer", content: { description: "Thoughtful plants and beautiful objects for a greener everyday.", shop_links: [ { label: "Indoor plants", href: "/shop" }, { label: "Succulents", href: "/shop" }, { label: "Planters", href: "/shop" }, { label: "Plant care", href: "#care" } ], about_links: [ { label: "Our story", href: "#story" }, { label: "Care journal", href: "#care" }, { label: "Account", href: "/account" }, { label: "Contact", href: "#newsletter" } ], copyright: "© 2026 VERDANT", tagline: "MADE FOR SLOW GROWERS" }, active: true, sort_order: 80 }
];

async function authorized() {
  const store = await cookies();
  return isValidAdminToken(store.get(adminCookieName())?.value);
}

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await supabaseSelect("home_content", "select=*&order=sort_order.asc");
  if (!result.configured || !result.response?.ok) return NextResponse.json({ error: "Unable to load homepage content." }, { status: 502 });
  const rows = Array.isArray(result.data) ? result.data as HomeSection[] : [];
  return NextResponse.json({ sections: rows.length ? rows : defaults });
}

export async function PUT(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const sectionKey = String(body?.section_key || "").trim();
    if (!sectionKey) return NextResponse.json({ error: "section_key is required." }, { status: 400 });
    const content = body?.content && typeof body.content === "object" ? body.content : {};
    const active = body?.active !== false;
    const sortOrder = Math.max(0, Math.round(Number(body?.sort_order) || 0));
    const existing = await supabaseSelect("home_content", `select=id&section_key=eq.${encodeURIComponent(sectionKey)}&limit=1`);
    if (!existing.configured || !existing.response?.ok) return NextResponse.json({ error: "Unable to check homepage content." }, { status: 502 });
    const rows = Array.isArray(existing.data) ? existing.data as { id: string }[] : [];
    if (rows[0]?.id) {
      const result = await supabaseUpdate("home_content", `id=eq.${encodeURIComponent(rows[0].id)}`, { content, active, sort_order: sortOrder, updated_at: new Date().toISOString() });
      if (!result.configured || !result.response?.ok) return NextResponse.json({ error: "Unable to save homepage section." }, { status: 400 });
      return NextResponse.json({ section: Array.isArray(result.data) ? result.data[0] ?? null : null });
    }
    const result = await supabaseInsert("home_content", { section_key: sectionKey, content, active, sort_order: sortOrder });
    if (!result.configured || !result.response?.ok) return NextResponse.json({ error: "Unable to create homepage section." }, { status: 400 });
    return NextResponse.json({ section: Array.isArray(result.data) ? result.data[0] ?? null : null }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid homepage section data." }, { status: 400 });
  }
}

export { defaults };
