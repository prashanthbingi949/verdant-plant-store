"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Product = {
  name: string;
  category: string;
  price: number;
  level: string;
  size: string;
  description: string;
  details: string[][];
  tone: "moss" | "sage" | "lime";
};

function PlantRender({ tone, large = false }: { tone: Product["tone"]; large?: boolean }) {
  const palette = {
    moss: ["#547342", "#78945b", "#c7c2b5"],
    sage: ["#607e54", "#98aa88", "#d4cdbf"],
    lime: ["#8ea64d", "#bbcd67", "#c8c1b0"],
  } as const;
  const [a, b, pot] = palette[tone];
  return (
    <div className={`relative h-full w-full ${large ? "min-h-[560px] sm:min-h-[680px]" : "min-h-[340px]"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(238,246,193,.62),transparent_45%)]" />
      <svg viewBox="0 0 560 560" className="relative h-full w-full" aria-hidden="true">
        <ellipse cx="280" cy="500" rx="132" ry="28" fill="#101510" fillOpacity=".13" />
        <path d="M280 445V205" stroke="#30472d" strokeWidth={large ? 13 : 9} strokeLinecap="round" />
        <path d="M276 306c-85-78-140-74-187-28 29 80 105 112 187 28Z" fill={a} />
        <path d="M292 270c41-95 106-120 178-96-12 79-73 130-178 96Z" fill={b} />
        <path d="M278 360c-73-52-130-36-169 15 37 55 94 69 169-15Z" fill={b} fillOpacity=".9" />
        <path d="M295 382c59-61 116-64 156-29-28 58-87 82-156 29Z" fill={a} fillOpacity=".92" />
        <path d="M282 204c-13-69 22-123 83-151 31 63 2 121-83 151Z" fill={tone === "lime" ? "#d7ed72" : b} />
        <path d="M180 443h200l-19 66H199l-19-66Z" fill={pot} />
        <ellipse cx="280" cy="444" rx="100" ry="18" fill="#9d988a" />
        <ellipse cx="280" cy="440" rx="78" ry="12" fill="#4e4534" />
        <path d="M214 444h132" stroke="#ded8c9" strokeOpacity=".7" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function ProductDetails({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "care">("about");
  const total = useMemo(() => product.price * quantity, [product.price, quantity]);

  return (
    <main className="min-h-screen bg-[#f4f5e9] text-[#101510]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f4f5e9]/90 px-5 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-sm font-extrabold tracking-[.14em]">VERDANT</Link>
          <nav className="hidden items-center gap-6 text-sm md:flex"><Link href="/" className="opacity-70 hover:opacity-100">Home</Link><Link href="/shop" className="font-semibold">Shop</Link><Link href="/#care" className="opacity-70 hover:opacity-100">Plant care</Link></nav>
          <Link href="/shop" className="rounded-full bg-[#ddf27a] px-4 py-2 text-sm font-bold">Back to plants</Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1.04fr_.96fr] lg:gap-20 lg:py-20">
        <div className="overflow-hidden rounded-[32px] bg-[#dde6cf] shadow-sm"><PlantRender tone={product.tone} large /></div>
        <div className="flex flex-col justify-center">
          <p className="text-[10px] font-bold tracking-[.2em] text-black/50">{product.category.toUpperCase()}</p>
          <h1 className="mt-4 text-5xl font-semibold leading-[.9] tracking-[-.055em] sm:text-7xl">{product.name}</h1>
          <div className="mt-5 flex items-center gap-3 text-sm text-black/55"><span>{product.level}</span><span>·</span><span>{product.size}</span></div>
          <p className="mt-8 max-w-xl text-base leading-8 text-black/60">{product.description}</p>
          <div className="mt-9 flex items-end gap-4"><strong className="text-3xl tracking-[-.04em]">₹{product.price.toLocaleString("en-IN")}</strong><span className="pb-1 text-xs text-black/45">taxes calculated at checkout</span></div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="flex h-12 w-fit items-center rounded-full border border-black/12 bg-white/45 p-1"><button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="h-10 w-10 rounded-full text-lg">−</button><span className="w-8 text-center text-sm font-bold">{quantity}</span><button onClick={() => setQuantity((value) => value + 1)} className="h-10 w-10 rounded-full text-lg">+</button></div>
            <button onClick={() => setAdded(true)} className="flex h-12 flex-1 items-center justify-center rounded-full bg-[#202d20] px-6 text-sm font-bold text-[#f4f5e9] transition hover:translate-y-[-1px]">{added ? `Added · ₹${total.toLocaleString("en-IN")}` : "Add to bag"}</button>
          </div>
          <div className="mt-12 border-t border-black/10">
            <div className="flex gap-7 border-b border-black/10"><button onClick={() => setActiveTab("about")} className={`py-4 text-sm font-bold ${activeTab === "about" ? "border-b-2 border-[#202d20]" : "text-black/45"}`}>About</button><button onClick={() => setActiveTab("care")} className={`py-4 text-sm font-bold ${activeTab === "care" ? "border-b-2 border-[#202d20]" : "text-black/45"}`}>Plant care</button></div>
            {activeTab === "about" ? <p className="py-6 text-sm leading-7 text-black/58">Selected for character, resilience and that little feeling of life a room gets when something green takes root.</p> : <div className="py-4">{product.details.map(([label, value]) => <div key={label} className="grid grid-cols-[110px_1fr] border-b border-black/7 py-3 text-sm"><span className="text-black/45">{label}</span><span>{value}</span></div>)}</div>}
          </div>
        </div>
      </section>

      <section className="bg-[#202d20] px-5 py-16 text-[#f4f5e9] sm:px-8 sm:py-20"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="text-[10px] font-bold tracking-[.2em] text-[#ddf27a]">A LITTLE MORE CARE</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">Good plants reward<br /><em>good routines.</em></h2></div><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-3xl border border-white/10 bg-white/5 p-6"><p className="text-xs text-white/50">01 / LIGHT</p><p className="mt-3 text-lg">Place near a bright, filtered window.</p></div><div className="rounded-3xl border border-white/10 bg-white/5 p-6"><p className="text-xs text-white/50">02 / WATER</p><p className="mt-3 text-lg">Water slowly and let excess drain.</p></div></div></div></section>
    </main>
  );
}
