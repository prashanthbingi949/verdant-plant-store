"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useCart } from "@/components/cart-provider";

type Tone = "moss" | "sage" | "lime";
type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  level: string;
  price: number;
  size: string;
  description: string;
  tone: Tone;
  stock: number;
  active: boolean;
  image_url?: string | null;
  image_urls?: string[];
};

const fallbackProducts: Product[] = [
  { id: "1", slug: "monstera-deliciosa", name: "Monstera Deliciosa", category: "Indoor plants", level: "Easy care", price: 1899, size: '12" pot', description: "A lush statement plant with generous split leaves.", tone: "moss", stock: 20, active: true },
  { id: "2", slug: "snake-plant", name: "Snake Plant", category: "Indoor plants", level: "Easy care", price: 899, size: '10" pot', description: "Architectural, resilient and happy in lower light.", tone: "sage", stock: 20, active: true },
  { id: "3", slug: "jade-plant", name: "Jade Plant", category: "Succulents", level: "Easy care", price: 649, size: '6" pot', description: "A compact succulent for desks, shelves and sunny corners.", tone: "lime", stock: 20, active: true },
  { id: "4", slug: "bird-of-paradise", name: "Bird of Paradise", category: "Indoor plants", level: "Medium care", price: 2499, size: '14" pot', description: "Bold tropical foliage for a room that needs presence.", tone: "moss", stock: 20, active: true },
  { id: "5", slug: "string-of-pearls", name: "String of Pearls", category: "Succulents", level: "Medium care", price: 1199, size: '6" hanging pot', description: "Trailing beads that soften shelves and hanging planters.", tone: "sage", stock: 20, active: true },
  { id: "6", slug: "lavender", name: "Lavender", category: "Outdoor plants", level: "Medium care", price: 799, size: '8" pot', description: "Fragrant flowering stems made for bright balconies.", tone: "lime", stock: 20, active: true },
  { id: "7", slug: "fiddle-leaf-fig", name: "Fiddle Leaf Fig", category: "Indoor plants", level: "Medium care", price: 2199, size: '12" pot', description: "Large fiddle-shaped leaves and a polished silhouette.", tone: "moss", stock: 20, active: true },
  { id: "8", slug: "aloe-vera", name: "Aloe Vera", category: "Succulents", level: "Easy care", price: 699, size: '6" pot', description: "A sunny, low-maintenance classic.", tone: "sage", stock: 20, active: true },
];

const palette: Record<Tone, { bg: string; leaf: string; soft: string }> = {
  moss: { bg: "#dfe8d2", leaf: "#5f7e4a", soft: "#aebf96" },
  sage: { bg: "#e3e9d9", leaf: "#6f8d63", soft: "#b9c6a5" },
  lime: { bg: "#e8edc8", leaf: "#8ea64d", soft: "#c8d66d" },
};

function PlantArtwork({ product }: { product: Product }) {
  const image = product.image_url || product.image_urls?.[0] || null;
  if (image) {
    return <img src={image} alt={product.name} className="h-full w-full object-contain p-5 transition duration-700 group-hover:scale-[1.04] sm:p-7" />;
  }

  const colors = palette[product.tone];
  return (
    <svg viewBox="0 0 420 420" className="h-full w-full transition duration-700 group-hover:scale-[1.04]" aria-hidden="true">
      <defs><radialGradient id={`shop-glow-${product.slug}`} cx="50%" cy="32%" r="62%"><stop offset="0" stopColor="#f7facf" stopOpacity=".8" /><stop offset="1" stopColor="#f7facf" stopOpacity="0" /></radialGradient></defs>
      <rect width="420" height="420" fill={`url(#shop-glow-${product.slug})`} />
      <ellipse cx="210" cy="369" rx="114" ry="24" fill="#152016" fillOpacity=".12" />
      <path d="M210 340V150" stroke="#31462e" strokeWidth="10" strokeLinecap="round" />
      <path d="M205 208c-63-60-121-60-166-22 23 63 88 94 166 22Z" fill={colors.leaf} />
      <path d="M216 184c34-69 84-92 146-75-8 63-51 100-146 75Z" fill={colors.soft} />
      <path d="M205 262c-63-46-112-37-147 6 35 50 91 57 147-6Z" fill={colors.soft} fillOpacity=".9" />
      <path d="M219 280c48-46 97-51 130-21-19 49-66 67-130 21Z" fill={colors.leaf} fillOpacity=".88" />
      <path d="M210 150c-10-52 17-94 67-122 24 51 4 94-67 122Z" fill={colors.soft} />
      <path d="M153 334h114l-16 44h-82l-16-44Z" fill="#bbb6a6" />
      <ellipse cx="210" cy="334" rx="57" ry="12" fill="#918b7d" /><ellipse cx="210" cy="331" rx="43" ry="8" fill="#504636" />
    </svg>
  );
}

function Pill({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${active ? "bg-[#202d20] text-[#f4f5e9] shadow-sm" : "bg-black/[.045] text-[#202d20] hover:bg-black/[.08]"}`}>{children}</button>;
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 8.8c0 5.1-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" /></svg>;
}

function CartIcon({ count }: { count: number }) {
  return <span className="relative grid h-11 w-11 place-items-center rounded-full bg-[#ddf27a] text-[#202d20] transition duration-300 group-hover:-translate-y-0.5 group-hover:scale-105"><svg viewBox="0 0 24 24" className="h-5 w-5 transition-transform duration-500 group-hover:rotate-[-8deg]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 4.5h2.2l1.5 9.1a2 2 0 0 0 2 1.7h7.8a2 2 0 0 0 1.9-1.5l1.4-6.3H7.2" /><circle cx="9.5" cy="19" r="1.2" /><circle cx="17.7" cy="19" r="1.2" /></svg>{count > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-[#f4f5e9] bg-[#202d20] px-1 text-[10px] font-black leading-none text-[#f4f5e9]">{count > 99 ? "99+" : count}</span>}</span>;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [liked, setLiked] = useState<string[]>([]);
  const [quickAdded, setQuickAdded] = useState<string[]>([]);
  const { itemCount, addItem } = useCart();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get("category");
    if (requestedCategory && ["Indoor plants", "Outdoor plants", "Succulents"].includes(requestedCategory)) setCategory(requestedCategory);
  }, []);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((data) => { if (Array.isArray(data?.products) && data.products.length) setProducts(data.products); }).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return [...products.filter((product) => {
      const categoryMatch = category === "All" || product.category === category;
      const levelMatch = level === "All" || product.level.toLowerCase().includes(level.toLowerCase());
      const queryMatch = !term || `${product.name} ${product.description}`.toLowerCase().includes(term);
      return categoryMatch && levelMatch && queryMatch && product.active;
    })].sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : a.slug.localeCompare(b.slug));
  }, [category, level, products, query, sort]);

  const toggleLike = (slug: string) => setLiked((items) => items.includes(slug) ? items.filter((item) => item !== slug) : [...items, slug]);

  const handleQuickAdd = (product: Product) => {
    if (product.stock < 1) return;
    addItem({ id: product.slug, name: product.name, price: Number(product.price), tone: product.tone, size: product.size, category: product.category, image_url: product.image_url || product.image_urls?.[0] || null }, 1);
    setQuickAdded((items) => items.includes(product.slug) ? items : [...items, product.slug]);
    window.setTimeout(() => setQuickAdded((items) => items.filter((slug) => slug !== product.slug)), 1800);
  };

  return <main className="min-h-screen bg-[#f4f5e9] text-[#101510]">
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f4f5e9]/90 px-5 py-4 backdrop-blur-xl sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between gap-5"><Link href="/" className="text-sm font-extrabold tracking-[0.14em]">VERDANT</Link><nav className="hidden items-center gap-6 text-sm md:flex"><Link href="/" className="opacity-65 hover:opacity-100">Home</Link><span className="font-semibold">Shop</span><Link href="/#collections" className="opacity-65 hover:opacity-100">Collections</Link><Link href="/#care" className="opacity-65 hover:opacity-100">Plant care</Link></nav><Link href="/cart" aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`} className="group inline-flex"><CartIcon count={itemCount} /></Link></div></header>

    <section className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8 sm:pt-20"><div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between"><div><p className="mb-4 text-[10px] font-black tracking-[0.24em] text-[#52634b]">THE VERDANT SHOP</p><h1 className="max-w-4xl text-5xl font-semibold leading-[.92] tracking-[-.055em] sm:text-7xl">Plants for <span className="font-serif italic font-normal">slower</span> spaces.</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-black/58 sm:text-base">Bring home statement greens, easy-care favourites and small plants chosen for beautiful everyday spaces.</p></div><div className="rounded-[26px] border border-black/10 bg-white/45 px-5 py-4 shadow-sm"><p className="text-[10px] font-black tracking-[.17em] text-black/42">OUR EDIT</p><p className="mt-1 text-sm font-semibold text-[#202d20]">Handpicked for slower spaces.</p></div></div></section>

    <section className="mx-auto max-w-7xl px-5 pb-8 sm:px-8"><div className="rounded-[30px] border border-black/10 bg-white/38 p-4 shadow-[0_12px_40px_rgba(32,45,32,.04)] sm:p-5"><div className="flex flex-col gap-3 lg:flex-row lg:items-center"><div className="relative flex-1"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search plants…" className="h-12 w-full rounded-full border border-black/10 bg-[#f4f5e9] px-5 text-sm outline-none transition placeholder:text-black/35 focus:border-black/25" /><span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-black/35">⌕</span></div><div className="flex flex-wrap gap-2"><Pill active={category === "All"} onClick={() => setCategory("All")}>All</Pill><Pill active={category === "Indoor plants"} onClick={() => setCategory("Indoor plants")}>Indoor</Pill><Pill active={category === "Outdoor plants"} onClick={() => setCategory("Outdoor plants")}>Outdoor</Pill><Pill active={category === "Succulents"} onClick={() => setCategory("Succulents")}>Succulents</Pill></div><div className="flex flex-wrap gap-2"><Pill active={level === "All"} onClick={() => setLevel("All")}>All care</Pill><Pill active={level === "Easy"} onClick={() => setLevel("Easy")}>Easy</Pill><Pill active={level === "Medium"} onClick={() => setLevel("Medium")}>Medium</Pill></div><select value={sort} onChange={(event) => setSort(event.target.value)} className="h-12 rounded-full border border-black/10 bg-[#f4f5e9] px-4 text-sm font-medium outline-none"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div></div></section>

    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-[10px] font-black tracking-[.2em] text-[#52634b]">CURATED GREENS</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.03em] sm:text-3xl">Made to be lived with.</h2></div><p className="text-xs font-semibold text-black/45">{filtered.length} selected</p></div>{filtered.length > 0 ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">{filtered.map((product) => { const isLiked = liked.includes(product.slug); const isAdded = quickAdded.includes(product.slug); return <article key={product.slug} className="group min-w-0"><div className="relative overflow-hidden rounded-[30px] bg-white/40 ring-1 ring-black/[.06] transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_20px_55px_rgba(32,45,32,.12)]"><Link href={`/shop/${product.slug}`} className="block"><div className={`relative aspect-[.86] overflow-hidden ${product.tone === "lime" ? "bg-[#e9efc5]" : product.tone === "sage" ? "bg-[#e7ecdf]" : "bg-[#e3ead8]"}`}><div className="absolute inset-x-5 top-5 z-10 flex items-center justify-between"><span className="rounded-full bg-[#f4f5e9]/80 px-3 py-1.5 text-[9px] font-black tracking-[.14em] text-[#31422f] backdrop-blur">{product.level.toUpperCase()}</span><button type="button" onClick={(event) => { event.preventDefault(); toggleLike(product.slug); }} aria-label={`${isLiked ? "Remove" : "Add"} ${product.name} from wishlist`} className={`grid h-10 w-10 place-items-center rounded-full bg-[#f4f5e9]/85 backdrop-blur transition hover:scale-105 ${isLiked ? "text-[#7b4c4c]" : "text-[#202d20]"}`}><HeartIcon filled={isLiked} /></button></div><div className="h-full w-full"><PlantArtwork product={product} /></div>{product.stock > 0 && product.stock <= 5 && <span className="absolute bottom-5 left-5 rounded-full bg-[#202d20]/88 px-3 py-1.5 text-[9px] font-black tracking-[.12em] text-[#f4f5e9]">ONLY {product.stock} LEFT</span>}</div></Link><div className="p-5"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-[10px] font-semibold tracking-[.08em] text-[#62705e]">{product.category} · {product.size}</p><Link href={`/shop/${product.slug}`} className="block"><h3 className="mt-2 truncate text-xl font-semibold tracking-[-.035em] hover:underline">{product.name}</h3></Link><p className="mt-2 line-clamp-2 text-sm leading-6 text-black/52">{product.description}</p></div><strong className="shrink-0 text-base">₹{Number(product.price).toLocaleString("en-IN")}</strong></div><div className="mt-5 flex items-center gap-2"><Link href={`/shop/${product.slug}`} className={`inline-flex h-11 flex-1 items-center justify-center rounded-full text-sm font-bold ${product.stock > 0 ? "bg-[#202d20] text-[#f4f5e9] hover:bg-[#101510]" : "cursor-not-allowed bg-black/10 text-black/40"}`}>{product.stock > 0 ? "View plant" : "Out of stock"}</Link><button type="button" onClick={() => handleQuickAdd(product)} disabled={product.stock < 1} className={`inline-flex h-11 flex-1 items-center justify-center rounded-full border text-sm font-bold transition ${product.stock > 0 ? "border-[#202d20] text-[#202d20] hover:border-[#ddf27a] hover:bg-[#ddf27a]" : "cursor-not-allowed border-black/10 text-black/30"}`}>{product.stock < 1 ? "Out of stock" : isAdded ? "Added ✓" : "Quick add"}</button></div></div></div></article>; })}</div> : <div className="mx-auto max-w-xl rounded-[30px] border border-black/10 bg-white/45 p-12 text-center"><p className="text-[10px] font-black tracking-[.2em] text-[#52634b]">NOTHING HERE YET</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Try another corner.</h2><p className="mt-3 text-sm leading-6 text-black/55">Search another plant or clear your filters to see the full edit.</p><button type="button" onClick={() => { setCategory("All"); setLevel("All"); setQuery(""); }} className="mt-6 rounded-full bg-[#202d20] px-6 py-3 text-sm font-bold text-[#f4f5e9]">Clear filters</button></div>}</section>
  </main>;
}
