"use client";

import Link from "next/link";
import VerdantSpotlightHero from "@/components/verdant-spotlight-hero";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/components/cart-provider";

type CmsSection = { section_key: string; content: Record<string, any>; active: boolean; sort_order: number };
type CmsProduct = { id: string; slug: string; name: string; category: string; level: string; price: number; size: string; description: string; tone: "moss" | "sage" | "lime"; stock: number; active: boolean; image_url?: string | null; image_urls?: string[]; featured?: boolean; sort_order?: number };
type LinkItem = { label?: string; title?: string; eyebrow?: string; note?: string; href?: string; number?: string };

const fallbackCollections: LinkItem[] = [
  { eyebrow: "01 / EASY CARE", title: "Indoor plants", note: "Calm, green companions for every room.", href: "/shop" },
  { eyebrow: "02 / SUN LOVERS", title: "Outdoor plants", note: "Bring a little wildness to balconies and gardens.", href: "/shop" },
  { eyebrow: "03 / MINIATURE", title: "Succulents", note: "Small shapes with a lot of personality.", href: "/shop" },
];

const fallbackProducts: CmsProduct[] = [
  { id: "monstera-deliciosa", slug: "monstera-deliciosa", name: "Monstera Deliciosa", category: "Indoor plants", level: "Easy care", price: 1899, size: '12" pot', description: "A lush statement plant with generous split leaves.", tone: "moss", stock: 20, active: true },
  { id: "snake-plant", slug: "snake-plant", name: "Snake Plant", category: "Indoor plants", level: "Easy care", price: 899, size: '10" pot', description: "Architectural, resilient and happy in lower light.", tone: "sage", stock: 20, active: true },
  { id: "jade-plant", slug: "jade-plant", name: "Jade Plant", category: "Succulents", level: "Easy care", price: 649, size: '6" pot', description: "A compact succulent for desks, shelves and sunny corners.", tone: "lime", stock: 20, active: true },
];

const realPlantImages: Record<string, string> = {
  "monstera-deliciosa": "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=88",
  "snake-plant": "https://images.unsplash.com/photo-1611211232932-da3113c5b960?auto=format&fit=crop&w=1200&q=88",
  "jade-plant": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=88",
};

const fallbackFooterShop: LinkItem[] = [
  { label: "Indoor plants", href: "/shop" },
  { label: "Succulents", href: "/shop" },
  { label: "Planters", href: "/shop" },
  { label: "Plant care", href: "/pages/plant-care" },
];
const fallbackFooterAbout: LinkItem[] = [
  { label: "Our story", href: "/#story" },
  { label: "Care journal", href: "/pages/plant-care" },
  { label: "Account", href: "/account" },
  { label: "Contact", href: "/#newsletter" },
];

function LeafMark({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 48 48" aria-hidden="true"><path d="M38.4 7.2C24.2 8.4 12 15.1 9.6 27.4c-1.2 6.2 1.8 11.1 7 12.1 8.2 1.5 16.7-5.2 19.1-13.7 1.5-5.2 1.6-11 2.7-18.6Z" fill="currentColor" /><path d="M10.4 38.1c6.2-8.2 12-13 21.2-17.6" fill="none" stroke="var(--cream)" strokeWidth="2" strokeLinecap="round" opacity=".7" /></svg>;
}

function BotanicalShape({ tone, image, alt }: { tone: string; image?: string | null; alt: string }) {
  if (image) return <div className="botanical-card"><img src={image} alt={alt} className="h-full w-full object-contain p-3 sm:p-5" loading="lazy" /></div>;
  return <div className={`botanical-card botanical-${tone}`}><div className="botanical-glow" /><svg viewBox="0 0 420 360" className="plant-art" aria-hidden="true"><path d="M205 318c9-48 9-94 0-143" fill="none" stroke="var(--forest)" strokeWidth="7" strokeLinecap="round" /><path d="M205 216c-39-42-74-55-116-43 13 40 49 69 116 43Z" fill="var(--leaf)" /><path d="M211 183c28-55 68-81 119-79 4 49-26 91-119 79Z" fill="var(--leaf-deep)" /><path d="M202 254c-52-26-92-18-119 16 33 29 75 31 119-16Z" fill="var(--leaf-soft)" /><path d="M210 272c36-42 75-50 114-34-11 39-48 64-114 34Z" fill="var(--leaf)" /><path d="M207 151c-13-49 3-87 42-113 25 37 15 77-42 113Z" fill="var(--lime)" /><path d="M176 318c-12 16-16 24-16 29h92c-1-5-5-13-16-29H176Z" fill="var(--pot)" /><path d="M165 346h102" stroke="var(--forest)" strokeWidth="7" strokeLinecap="round" opacity=".45" /></svg><span className="plant-spark spark-one" /><span className="plant-spark spark-two" /></div>;
}

function Icon({ name }: { name: "heart" | "arrow" }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "heart") return <svg {...common}><path d="M20.8 8.8c0 5.1-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" /></svg>;
  return <svg {...common}><path d="M5 12h13" /><path d="m13 7 5 5-5 5" /></svg>;
}

export default function Home() {
  const { addItem } = useCart();
  const [sections, setSections] = useState<CmsSection[]>([]);
  const [products, setProducts] = useState<CmsProduct[]>(fallbackProducts);
  const [liked, setLiked] = useState<string[]>([]);
  const [added, setAdded] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/cms/home", { cache: "no-store" }).then((r) => r.ok ? r.json() : null),
      fetch("/api/products", { cache: "no-store" }).then((r) => r.ok ? r.json() : null),
    ]).then(([cms, productData]) => {
      if (Array.isArray(cms?.sections)) setSections(cms.sections);
      if (Array.isArray(productData?.products) && productData.products.length) setProducts(productData.products);
    }).catch(() => {});
  }, []);

  const section = (key: string) => sections.find((s) => s.section_key === key);
  const visible = (key: string) => section(key)?.active !== false;
  const content = (key: string) => section(key)?.content || {};
  const featuredProducts = [...products.filter((p) => p.active && (p.featured || false)), ...products.filter((p) => p.active && !p.featured)].slice(0, 3);
  const collections = Array.isArray(content("collections").items) && content("collections").items.length ? content("collections").items : fallbackCollections;
  const careItems = Array.isArray(content("care").items) ? content("care").items : [];
  const footer = content("footer");
  const story = content("story");
  const newsletter = content("newsletter");
  const marqueeItems = Array.isArray(content("marquee").items) && content("marquee").items.length
    ? content("marquee").items.map((item: unknown) => String(item || "").trim()).filter(Boolean)
    : String(content("marquee").text || "PLANT MORE JOY").split("·").map((item: string) => item.trim()).filter(Boolean);
  const safeMarqueeItems = marqueeItems.length ? marqueeItems : ["PLANT MORE JOY"];
  const marqueeSequence = [...safeMarqueeItems, ...safeMarqueeItems, ...safeMarqueeItems, ...safeMarqueeItems, ...safeMarqueeItems, ...safeMarqueeItems];
  const footerShopLinks = Array.isArray(footer.shop_links) && footer.shop_links.length ? footer.shop_links : fallbackFooterShop;
  const footerAboutLinks = Array.isArray(footer.about_links) && footer.about_links.length ? footer.about_links : fallbackFooterAbout;

  const handleAdd = (product: CmsProduct) => {
    if (product.stock < 1) return;
    addItem({ id: product.slug, name: product.name, price: Number(product.price), tone: product.tone, size: product.size, category: product.category, image_url: product.image_url || product.image_urls?.[0] || realPlantImages[product.slug] || null }, 1);
    setAdded((items) => items.includes(product.slug) ? items : [...items, product.slug]);
    window.setTimeout(() => setAdded((items) => items.filter((slug) => slug !== product.slug)), 1800);
  };

  return <main className="verdant-site">
    <VerdantSpotlightHero />

    {visible("marquee") && <section className="marquee"><div className="marquee-flow" style={{ display: "flex", width: "max-content", minWidth: "max-content", animation: "marquee 24s linear infinite" }}>{marqueeSequence.map((item: string, index: number) => <span key={`marquee-${index}`} className="marquee-item" style={{ display: "inline-flex", alignItems: "center", flexShrink: 0, padding: "14px 24px" }}>{item}<b aria-hidden="true" style={{ display: "inline-block", padding: "0 24px" }}>•</b></span>)}</div></section>}

    {visible("collections") && <section className="section collections-section" id="collections"><div className="section-heading"><div><p className="eyebrow">{content("collections").eyebrow || "THE VERDANT EDIT"}</p><h2>{content("collections").title || "Choose your"} <em>{content("collections").emphasized_title || "green."}</em></h2></div><p>{content("collections").description || "From first-time plant parents to lifelong gardeners, there is a little something growing here for everyone."}</p></div><div className="collection-grid">{collections.map((item: LinkItem, index: number) => <motion.a href={item.href || "/shop"} className="collection-card" key={`${item.title || "collection"}-${index}`} whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 280, damping: 22 }}><div className="collection-copy"><span>{item.eyebrow}</span><h3>{item.title}</h3><p>{item.note}</p><span className="round-arrow"><Icon name="arrow" /></span></div><div className={`collection-art art-${index + 1}`}><BotanicalShape tone={`collection-${index + 1}`} alt={item.title || "Collection"} /></div></motion.a>)}</div></section>}

    {visible("featured") && <section className="section shop-section" id="shop"><div className="section-heading compact"><div><p className="eyebrow">{content("featured").eyebrow || "MOST LOVED"}</p><h2>{content("featured").title || "Little"} <em>{content("featured").emphasized_title || "legends."}</em></h2></div><Link className="text-link" href={content("featured").link_href || "/shop"}>{content("featured").link_label || "View all plants"} <Icon name="arrow" /></Link></div><div className="product-grid">{featuredProducts.map((product) => <article className="product-card" key={product.slug}><div className="product-image"><button type="button" className={`wish ${liked.includes(product.slug) ? "is-liked" : ""}`} onClick={() => setLiked((items) => items.includes(product.slug) ? items.filter((item) => item !== product.slug) : [...items, product.slug])} aria-label={`Wishlist ${product.name}`}><Icon name="heart" /></button><Link href={`/shop/${product.slug}`} className="block h-full"><BotanicalShape tone={product.tone} image={product.image_url || product.image_urls?.[0] || realPlantImages[product.slug]} alt={product.name} /></Link>{content("featured").badge && <span className="product-badge">{content("featured").badge}</span>}</div><div className="product-info"><div><p>{product.category} · {product.level}</p><Link href={`/shop/${product.slug}`}><h3>{product.name}</h3></Link></div><div className="product-buy"><strong>₹{Number(product.price).toLocaleString("en-IN")}</strong><button type="button" onClick={() => handleAdd(product)}>{added.includes(product.slug) ? "Added ✓" : "Add +"}</button></div></div></article>)}</div></section>}

    {visible("story") && <section className="story-section" id="story"><div className="story-art"><div className="story-card"><span>{story.established || "EST. 2026"}</span><div className="story-circle"><LeafMark /></div><strong>{(story.card_line || "Good things take root.").split(" ").slice(0, 2).join(" ")}<br />{(story.card_line || "Good things take root.").split(" ").slice(2).join(" ")}</strong></div><span className="story-stem" /></div><div className="story-copy"><p className="eyebrow">{story.eyebrow || "THE VERDANT WAY"}</p><h2>{story.title || "More than a store."}<br /><em>{story.emphasized_title || "A little ritual."}</em></h2><p>{story.body || "We believe plants change a room, then slowly change the way the room feels."}</p><a className="button button-dark" href={story.button_href || "#care"}>{story.button_label || "Explore plant care"} <Icon name="arrow" /></a></div></section>}

    {visible("care") && <section className="care-section" id="care"><div className="care-heading"><p className="eyebrow">{content("care").eyebrow || "PLANT CARE, MADE SIMPLE"}</p><h2>{content("care").title || "Less guesswork."}<br /><em>{content("care").emphasized_title || "More growing."}</em></h2><p>{content("care").description || "Practical guides for water, light, soil and everything in between."}</p></div><div className="care-list">{careItems.map((item: LinkItem, index: number) => <a href={item.href || "/pages/plant-care"} key={`${item.number || index}-${item.title}`}><span>{item.number || String(index + 1).padStart(2, "0")}</span><strong>{item.title}</strong><Icon name="arrow" /></a>)}</div></section>}

    {visible("newsletter") && <section className="newsletter" id="newsletter"><div><p className="eyebrow">{newsletter.eyebrow || "A NOTE FROM VERDANT"}</p><h2>{newsletter.title || "Grow slowly."}<br /><em>{newsletter.emphasized_title || "Stay curious."}</em></h2></div><form onSubmit={(event) => event.preventDefault()}><label htmlFor="email">{newsletter.description || "Plant tips, new arrivals and good things — occasionally."}</label><div className="email-row"><input id="email" type="email" placeholder={newsletter.placeholder || "Your email address"} /><button className="button button-lime" type="submit">{newsletter.button_label || "Join us"} <Icon name="arrow" /></button></div></form></section>}

    {visible("footer") && <footer className="footer" id="account"><div className="footer-brand"><Link className="brand light" href="/"><span className="brand-mark"><LeafMark /></span><span>VERDANT</span></Link><p>{footer.description || "Thoughtful plants and beautiful objects for a greener everyday."}</p></div><div className="footer-col"><span>SHOP</span>{footerShopLinks.map((item: LinkItem, index: number) => <Link href={item.href || "/shop"} key={`${item.label || "shop"}-${index}`}>{item.label || "Shop"}</Link>)}</div><div className="footer-col"><span>ABOUT</span>{footerAboutLinks.map((item: LinkItem, index: number) => <Link href={item.href || "#story"} key={`${item.label || "about"}-${index}`}>{item.label || "About"}</Link>)}</div><div className="footer-end"><span>{footer.copyright || "© 2026 VERDANT"}</span><span>{footer.tagline || "MADE FOR SLOW GROWERS"}</span></div></footer>}
  </main>;
}
