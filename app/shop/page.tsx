"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const products = [
  { id: 1, name: "Monstera Deliciosa", category: "Indoor", level: "Easy", price: 1899, tone: "moss", description: "A lush statement plant with large sculptural leaves." },
  { id: 2, name: "Snake Plant", category: "Indoor", level: "Easy", price: 899, tone: "sage", description: "Architectural, resilient and happy in lower light." },
  { id: 3, name: "Jade Plant", category: "Succulents", level: "Easy", price: 649, tone: "lime", description: "A compact succulent for desks, shelves and sunny corners." },
  { id: 4, name: "Bird of Paradise", category: "Indoor", level: "Medium", price: 2499, tone: "moss", description: "Bold tropical foliage for a room that needs presence." },
  { id: 5, name: "String of Pearls", category: "Succulents", level: "Medium", price: 1199, tone: "sage", description: "Trailing beads that soften shelves and hanging planters." },
  { id: 6, name: "Lavender", category: "Outdoor", level: "Medium", price: 799, tone: "lime", description: "Fragrant flowering stems made for bright balconies." },
  { id: 7, name: "Fiddle Leaf Fig", category: "Indoor", level: "Medium", price: 2199, tone: "moss", description: "Large fiddle-shaped leaves and a polished silhouette." },
  { id: 8, name: "Aloe Vera", category: "Succulents", level: "Easy", price: 699, tone: "sage", description: "A sunny, low-maintenance classic with practical charm." },
];

function PlantIllustration({ tone }: { tone: string }) {
  const palette: Record<string, [string, string, string]> = {
    moss: ["#5d7d45", "#78945b", "#b7b09e"],
    sage: ["#6f8d63", "#9eaf8e", "#d0cab7"],
    lime: ["#8ea64d", "#b6ca5e", "#c5bfad"],
  };
  const [a, b, pot] = palette[tone] ?? palette.moss;
  return (
    <svg viewBox="0 0 360 320" className="w-full h-full" aria-hidden="true">
      <defs>
        <radialGradient id={`glow-${tone}`} cx="50%" cy="38%" r="65%">
          <stop offset="0" stopColor="#f0f6c5" stopOpacity=".45" />
          <stop offset="1" stopColor="#f0f6c5" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="360" height="320" fill={`url(#glow-${tone})`} />
      <ellipse cx="180" cy="286" rx="82" ry="16" fill="#101510" fillOpacity=".12" />
      <path d="M180 270V118" stroke="#344a30" strokeWidth="8" strokeLinecap="round" />
      <path d="M177 175c-56-49-94-45-120-18 19 48 70 67 120 18Z" fill={a} />
      <path d="M184 151c26-59 68-71 112-56-7 49-47 83-112 56Z" fill={b} />
      <path d="M178 215c-47-35-81-26-103 4 25 34 61 41 103-4Z" fill={b} fillOpacity=".85" />
      <path d="M185 224c38-38 75-41 99-20-16 36-52 51-99 20Z" fill={a} fillOpacity=".9" />
      <path d="M181 116c-7-44 15-76 55-91 19 39 0 72-55 91Z" fill={b} />
      <path d="M124 274h112l-11 27h-90l-11-27Z" fill={pot} />
      <ellipse cx="180" cy="274" rx="56" ry="10" fill="#8d8879" fillOpacity=".85" />
      <ellipse cx="180" cy="272" rx="45" ry="7" fill="#514735" />
    </svg>
  );
}

function Pill({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-full px-4 py-2 text-sm transition ${active ? "bg-[#202d20] text-[#f4f5e9]" : "bg-black/5 text-[#202d20] hover:bg-black/10"}`}>
      {children}
    </button>
  );
}

export default function ShopPage() {
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [cart, setCart] = useState<number[]>([]);

  const filtered = useMemo(() => {
    const result = products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      const matchesLevel = level === "All" || product.level === level;
      const matchesQuery = `${product.name} ${product.description}`.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesLevel && matchesQuery;
    });
    return [...result].sort((a, b) => {
      if (sort === "low") return a.price - b.price;
      if (sort === "high") return b.price - a.price;
      return a.id - b.id;
    });
  }, [category, level, query, sort]);

  return (
    <main className="min-h-screen bg-[#f4f5e9] text-[#101510]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f4f5e9]/90 px-5 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
          <Link href="/" className="text-sm font-extrabold tracking-[0.14em]">VERDANT</Link>
          <nav className="hidden items-center gap-6 text-sm md:flex"><Link href="/" className="opacity-70 hover:opacity-100">Home</Link><span className="font-semibold">Shop</span><Link href="/#collections" className="opacity-70 hover:opacity-100">Collections</Link><Link href="/#care" className="opacity-70 hover:opacity-100">Plant care</Link></nav>
          <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })} className="rounded-full bg-[#ddf27a] px-4 py-2 text-sm font-bold">Bag ({cart.length})</button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-8 pt-16 sm:px-8 sm:pt-20">
        <p className="mb-4 text-[10px] font-bold tracking-[0.2em] text-black/50">THE VERDANT SHOP</p>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.92] tracking-[-0.05em] sm:text-7xl">Plants for <span className="font-serif italic font-normal">slower</span> spaces.</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-black/60 sm:text-base">Browse indoor plants, outdoor growers and easy-care favourites. Every card below is ready to become real product data later.</p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white/45 p-4 text-sm shadow-sm"><span className="font-bold">{filtered.length}</span> plants in this edit</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-6 sm:px-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-white/35 p-4 sm:p-5 lg:flex-row lg:items-center">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search plants…" className="h-11 min-w-0 flex-1 rounded-full border border-black/10 bg-[#f4f5e9] px-4 text-sm outline-none focus:border-black/25" />
          <div className="flex flex-wrap gap-2"><Pill active={category === "All"} onClick={() => setCategory("All")}>All</Pill><Pill active={category === "Indoor"} onClick={() => setCategory("Indoor")}>Indoor</Pill><Pill active={category === "Outdoor"} onClick={() => setCategory("Outdoor")}>Outdoor</Pill><Pill active={category === "Succulents"} onClick={() => setCategory("Succulents")}>Succulents</Pill></div>
          <div className="flex gap-2"><Pill active={level === "All"} onClick={() => setLevel("All")}>All care</Pill><Pill active={level === "Easy"} onClick={() => setLevel("Easy")}>Easy</Pill><Pill active={level === "Medium"} onClick={() => setLevel("Medium")}>Medium</Pill></div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-11 rounded-full border border-black/10 bg-[#f4f5e9] px-4 text-sm outline-none"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-5 pb-24 sm:px-8 sm:grid-cols-2 xl:grid-cols-4">
        {filtered.map((product) => {
          const inCart = cart.includes(product.id);
          return (
            <article key={product.id} className="group">
              <div className="relative aspect-[.82] overflow-hidden rounded-[28px] bg-[#e2e8d3] p-2 transition duration-500 group-hover:-translate-y-1 group-hover:shadow-xl">
                <div className="absolute left-4 top-4 z-10 rounded-full bg-[#f4f5e9]/75 px-3 py-1.5 text-[9px] font-bold tracking-[0.14em] backdrop-blur">{product.level.toUpperCase()} CARE</div>
                <div className="h-full w-full transition duration-700 group-hover:scale-[1.03]"><PlantIllustration tone={product.tone} /></div>
              </div>
              <div className="flex items-start justify-between gap-4 px-1 pt-4">
                <div><p className="text-[10px] tracking-wide text-black/45">{product.category} · {product.level}</p><h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">{product.name}</h2><p className="mt-2 text-sm leading-6 text-black/55">{product.description}</p></div>
                <strong className="shrink-0 text-base">₹{product.price.toLocaleString("en-IN")}</strong>
              </div>
              <button onClick={() => setCart((items) => inCart ? items.filter((id) => id !== product.id) : [...items, product.id])} className={`mt-4 h-11 w-full rounded-full text-sm font-bold transition ${inCart ? "bg-[#ddf27a] text-[#101510]" : "bg-[#202d20] text-[#f4f5e9] hover:scale-[1.01]"}`}>
                {inCart ? "Added · Remove" : "Add to bag"}
              </button>
            </article>
          );
        })}
      </section>

      {filtered.length === 0 && <div className="mx-auto max-w-xl px-5 pb-32 text-center sm:px-8"><div className="rounded-3xl border border-black/10 bg-white/50 p-10"><h2 className="text-2xl font-semibold">Nothing found.</h2><p className="mt-2 text-sm text-black/55">Try another plant name or clear a filter.</p><button onClick={() => { setCategory("All"); setLevel("All"); setQuery(""); }} className="mt-5 rounded-full bg-[#202d20] px-5 py-3 text-sm font-bold text-white">Clear filters</button></div></div>}
    </main>
  );
}
