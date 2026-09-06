"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";

type Tone = "moss" | "sage" | "lime";
type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  product_type?: "Plants" | "Gardening Supplies";
  level: string;
  price: number;
  size: string;
  description: string;
  tone: Tone;
  stock: number;
  active: boolean;
  featured?: boolean;
  sort_order?: number;
  image_url?: string | null;
  image_urls?: string[];
};
type Category = {
  id: string;
  name: string;
  slug: string;
  product_type: "Plants" | "Gardening Supplies";
  description: string;
  sort_order: number;
  active: boolean;
};
type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  active: boolean;
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

const realPlantImages: Record<string, string> = {
  "monstera-deliciosa": "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=88",
  "snake-plant": "https://images.unsplash.com/photo-1611211232932-da3113c5b960?auto=format&fit=crop&w=1200&q=88",
  "jade-plant": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=88",
  "bird-of-paradise": "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=1200&q=88",
  "string-of-pearls": "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=1200&q=88",
  "lavender": "https://images.unsplash.com/photo-1451336819701-5a83f6534292?auto=format&fit=crop&w=1200&q=88",
  "fiddle-leaf-fig": "https://images.unsplash.com/photo-1517191434949-5e90cd67d2b6?auto=format&fit=crop&w=1200&q=88",
  "aloe-vera": "https://images.unsplash.com/photo-1513360994626-fc3639d1cc82?auto=format&fit=crop&w=1200&q=88",
};

const categoryImages: Record<string, string> = {
  "indoor-decorative-greens": realPlantImages["monstera-deliciosa"],
  "outdoor-landscape-plants": realPlantImages["lavender"],
  "succulents-cacti": realPlantImages["jade-plant"],
  "fruit-vegetable-saplings": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1000&q=88",
  "seasonal-flowering-plants": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=88",
  "pots-planters": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=88",
  "soil-growing-media": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1000&q=88",
  "fertilizers-nutrients": "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=1000&q=88",
  "pest-control": "https://images.unsplash.com/photo-1621460248083-6271cc4437a8?auto=format&fit=crop&w=1000&q=88",
  "tools-equipment": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1000&q=88",
};
const categoryFallbackImages = [
  realPlantImages["monstera-deliciosa"],
  realPlantImages["snake-plant"],
  realPlantImages["jade-plant"],
  realPlantImages["lavender"],
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1000&q=88",
];

const palette: Record<Tone, { leaf: string; soft: string }> = {
  moss: { leaf: "#5f7e4a", soft: "#aebf96" },
  sage: { leaf: "#6f8d63", soft: "#b9c6a5" },
  lime: { leaf: "#8ea64d", soft: "#c8d66d" },
};

function imageForCategory(category: Category, index: number) {
  return categoryImages[category.slug] || categoryFallbackImages[index % categoryFallbackImages.length];
}

function PlantArtwork({ product }: { product: Product }) {
  const image = product.image_url || product.image_urls?.[0] || realPlantImages[product.slug] || null;
  if (image) {
    return <div className="relative h-full w-full overflow-hidden rounded-[24px] bg-[#e6ebdf]"><div className="absolute inset-x-[14%] bottom-5 h-12 rounded-full bg-black/10 blur-2xl" /><img src={image} alt={product.name} className="relative h-full w-full object-contain p-4 sm:p-6 transition duration-700 group-hover:scale-[1.045]" loading="lazy" /></div>;
  }
  const colors = palette[product.tone] || palette.moss;
  return <svg viewBox="0 0 420 420" className="h-full w-full transition duration-700 group-hover:scale-[1.04]" aria-hidden="true"><defs><radialGradient id={`shop-glow-${product.slug}`} cx="50%" cy="32%" r="62%"><stop offset="0" stopColor="#f7facf" stopOpacity=".8" /><stop offset="1" stopColor="#f7facf" stopOpacity="0" /></radialGradient></defs><rect width="420" height="420" fill={`url(#shop-glow-${product.slug})`} /><ellipse cx="210" cy="369" rx="114" ry="24" fill="#152016" fillOpacity=".12" /><path d="M210 340V150" stroke="#31462e" strokeWidth="10" strokeLinecap="round" /><path d="M205 208c-63-60-121-60-166-22 23 63 88 94 166 22Z" fill={colors.leaf} /><path d="M216 184c34-69 84-92 146-75-8 63-51 100-146 75Z" fill={colors.soft} /><path d="M205 262c-63-46-112-37-147 6 35 50 91 57 147-6Z" fill={colors.soft} fillOpacity=".9" /><path d="M219 280c48-46 97-51 130-21-19 49-66 67-130 21Z" fill={colors.leaf} fillOpacity=".88" /><path d="M210 150c-10-52 17-94 67-122 24 51 4 94-67 122Z" fill={colors.soft} /><path d="M153 334h114l-16 44h-82l-16-44Z" fill="#bbb6a6" /><ellipse cx="210" cy="334" rx="57" ry="12" fill="#918b7d" /><ellipse cx="210" cy="331" rx="43" ry="8" fill="#504636" /></svg>;
}

function CartIcon({ count }: { count: number }) {
  return <span className="relative grid h-11 w-11 place-items-center rounded-full bg-[#ddf27a] text-[#202d20] transition duration-300 group-hover:-translate-y-0.5 group-hover:scale-105"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 4.5h2.2l1.5 9.1a2 2 0 0 0 2 1.7h7.8a2 2 0 0 0 1.9-1.5l1.4-6.3H7.2" /><circle cx="9.5" cy="19" r="1.2" /><circle cx="17.7" cy="19" r="1.2" /></svg>{count > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-[#f4f5e9] bg-[#202d20] px-1 text-[10px] font-black leading-none text-[#f4f5e9]">{count > 99 ? "99+" : count}</span>}</span>;
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 8.8c0 5.1-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" /></svg>;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [category, setCategory] = useState("All");
  const [subcategory, setSubcategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [type, setType] = useState<"All" | "Plants" | "Gardening Supplies">("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [liked, setLiked] = useState<string[]>([]);
  const [quickAdded, setQuickAdded] = useState<string[]>([]);
  const { itemCount, addItem } = useCart();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("category");
    const requestedType = params.get("type");
    if (requested) setCategory(requested);
    if (requestedType === "Plants" || requestedType === "Gardening Supplies") setType(requestedType);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/products", { cache: "no-store" }).then((r) => r.ok ? r.json() : null),
      fetch("/api/cms/catalog", { cache: "no-store" }).then((r) => r.ok ? r.json() : null),
    ]).then(([productData, catalogData]) => {
      if (Array.isArray(productData?.products) && productData.products.length) setProducts(productData.products);
      if (Array.isArray(catalogData?.categories)) setCategories(catalogData.categories.filter((item: Category) => item.active));
      if (Array.isArray(catalogData?.subcategories)) setSubcategories(catalogData.subcategories.filter((item: Subcategory) => item.active));
    }).catch(() => {});
  }, []);

  const selectedCategory = categories.find((item) => item.name === category || item.slug === category);
  const selectedSubcategories = selectedCategory ? subcategories.filter((item) => item.category_id === selectedCategory.id).sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)) : [];
  const visibleCategories = categories.filter((item) => type === "All" || item.product_type === type).sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const selectedSub = selectedSubcategories.find((item) => item.slug === subcategory || item.name === subcategory);
    return products.filter((product) => {
      const productTypeMatch = type === "All" || product.product_type === type || (type === "Plants" && !product.product_type);
      const categoryMatch = category === "All" || product.category === selectedCategory?.name || product.category === selectedCategory?.slug || product.category === category;
      const subMatch = subcategory === "All" || product.subcategory === selectedSub?.name || product.subcategory === selectedSub?.slug || product.subcategory === subcategory;
      const levelMatch = level === "All" || product.level.toLowerCase().includes(level.toLowerCase());
      const text = `${product.name} ${product.description} ${product.category} ${product.subcategory || ""}`.toLowerCase();
      return productTypeMatch && categoryMatch && subMatch && levelMatch && product.active && (!term || text.includes(term));
    }).sort((a, b) => sort === "low" ? Number(a.price) - Number(b.price) : sort === "high" ? Number(b.price) - Number(a.price) : (Number(b.featured) - Number(a.featured)) || (Number(a.sort_order || 0) - Number(b.sort_order || 0)) || a.name.localeCompare(b.name));
  }, [category, level, products, query, selectedCategory, selectedSubcategories, sort, subcategory, type]);

  const chooseCategory = (value: string) => { setCategory(value); setSubcategory("All"); };
  const toggleLike = (slug: string) => setLiked((items) => items.includes(slug) ? items.filter((item) => item !== slug) : [...items, slug]);
  const handleQuickAdd = (product: Product) => {
    if (product.stock < 1) return;
    addItem({ id: product.slug, name: product.name, price: Number(product.price), tone: product.tone, size: product.size, category: product.category, image_url: product.image_url || product.image_urls?.[0] || realPlantImages[product.slug] || null }, 1);
    setQuickAdded((items) => items.includes(product.slug) ? items : [...items, product.slug]);
    window.setTimeout(() => setQuickAdded((items) => items.filter((slug) => slug !== product.slug)), 1800);
  };

  return <main className="verdant-shop-page min-h-screen bg-[#f4f5e9] text-[#101510]">
    <style>{`
      .verdant-shop-page .shop-category-panel{position:relative;overflow:hidden;border:1px solid rgba(16,21,16,.11);background:rgba(251,252,245,.72);box-shadow:0 20px 60px rgba(32,45,32,.05);border-radius:32px}
      .verdant-shop-page .shop-category-hero{position:relative;overflow:hidden;min-height:188px;padding:30px;background:#dfe8d1}
      .verdant-shop-page .shop-category-hero::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(20,31,22,.84) 0%,rgba(20,31,22,.42) 48%,rgba(20,31,22,.1) 100%),url('https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1800&q=90') center 58%/cover}
      .verdant-shop-page .shop-category-hero-content{position:relative;z-index:1;max-width:560px;color:#f4f5e9}
      .verdant-shop-page .shop-category-hero h2{margin:8px 0 7px;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:clamp(32px,4vw,54px);line-height:.95;letter-spacing:-.045em}
      .verdant-shop-page .shop-category-tabs{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:14px}
      .verdant-shop-page .shop-category-tab{border:1px solid rgba(244,245,233,.18);background:rgba(244,245,233,.11);color:#f4f5e9;border-radius:999px;padding:9px 15px;font-size:12px;font-weight:750;backdrop-filter:blur(10px);transition:all .24s ease}
      .verdant-shop-page .shop-category-tab:hover{background:rgba(244,245,233,.18);transform:translateY(-1px)}
      .verdant-shop-page .shop-category-tab.active{background:#ddf27a;color:#101510;border-color:#ddf27a}
      .verdant-shop-page .shop-search{position:absolute;z-index:2;left:32px;right:32px;bottom:-27px;height:54px;border:1px solid rgba(16,21,16,.1);background:rgba(251,252,245,.96);box-shadow:0 14px 34px rgba(16,21,16,.12);border-radius:999px;padding:0 20px;font-size:14px;outline:none}
      .verdant-shop-page .shop-search:focus{border-color:rgba(16,21,16,.28);box-shadow:0 14px 40px rgba(16,21,16,.16)}
      .verdant-shop-page .shop-category-body{padding:48px 28px 24px}
      .verdant-shop-page .shop-category-rail{display:flex;gap:14px;overflow-x:auto;padding:4px 2px 11px;scroll-snap-type:x proximity;scrollbar-width:thin}
      .verdant-shop-page .shop-category-card{flex:0 0 clamp(148px,14vw,178px);scroll-snap-align:start;border:1px solid rgba(16,21,16,.08);background:#f7f8ee;border-radius:24px;overflow:hidden;text-align:left;box-shadow:0 8px 24px rgba(32,45,32,.035);transition:transform .28s ease,box-shadow .28s ease,border-color .28s ease}
      .verdant-shop-page .shop-category-card:hover{transform:translateY(-5px);box-shadow:0 18px 38px rgba(32,45,32,.11);border-color:rgba(16,21,16,.16)}
      .verdant-shop-page .shop-category-card.active{border-color:#202d20;box-shadow:0 15px 34px rgba(32,45,32,.14)}
      .verdant-shop-page .shop-category-photo{position:relative;height:128px;background:#dfe7d4;overflow:hidden}
      .verdant-shop-page .shop-category-photo::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 48%,rgba(16,21,16,.08))}
      .verdant-shop-page .shop-category-photo img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s cubic-bezier(.2,.7,.2,1)}
      .verdant-shop-page .shop-category-card:hover .shop-category-photo img{transform:scale(1.06)}
      .verdant-shop-page .shop-category-copy{padding:13px 13px 14px;min-height:68px}
      .verdant-shop-page .shop-category-copy strong{display:block;font-size:13px;line-height:1.15;letter-spacing:-.02em}
      .verdant-shop-page .shop-category-copy span{display:block;margin-top:5px;font-size:9px;line-height:1.3;color:rgba(16,21,16,.52)}
      .verdant-shop-page .shop-control-row{display:flex;justify-content:space-between;align-items:center;gap:14px;margin-top:18px;padding-top:15px;border-top:1px solid rgba(16,21,16,.09)}
      .verdant-shop-page .shop-control-note{font-size:11px;color:rgba(16,21,16,.5)}
      .verdant-shop-page .shop-controls{display:flex;gap:7px;align-items:center;flex-wrap:wrap}
      .verdant-shop-page .shop-pill{border:1px solid rgba(16,21,16,.09);background:#f2f3e9;color:#202d20;border-radius:999px;padding:9px 13px;font-size:11px;font-weight:750;transition:.22s ease}
      .verdant-shop-page .shop-pill:hover{transform:translateY(-1px);background:#eaecdf}.verdant-shop-page .shop-pill.active{background:#202d20;color:#f4f5e9;border-color:#202d20}
      .verdant-shop-page .shop-select{height:38px;border:1px solid rgba(16,21,16,.1);background:#f4f5e9;border-radius:999px;padding:0 13px;font-size:11px;font-weight:700;outline:none}
      .verdant-shop-page .shop-subcats{display:flex;gap:7px;flex-wrap:wrap;margin-top:14px}
      .verdant-shop-page .shop-subcat{border:1px solid rgba(16,21,16,.08);background:rgba(32,45,32,.04);color:#202d20;border-radius:999px;padding:7px 11px;font-size:10px;font-weight:700}
      .verdant-shop-page .shop-subcat.active{background:#ddf27a;border-color:#ddf27a}
      @media(max-width:760px){
        .verdant-shop-page .shop-category-hero{min-height:210px;padding:23px 20px}.verdant-shop-page .shop-category-hero::before{background:linear-gradient(90deg,rgba(20,31,22,.88),rgba(20,31,22,.34)),url('https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=88') center/cover}
        .verdant-shop-page .shop-search{left:20px;right:20px;bottom:-25px}.verdant-shop-page .shop-category-body{padding:46px 17px 20px}.verdant-shop-page .shop-category-rail{gap:11px}.verdant-shop-page .shop-category-card{flex-basis:150px}.verdant-shop-page .shop-category-photo{height:118px}.verdant-shop-page .shop-control-row{align-items:flex-start;flex-direction:column}.verdant-shop-page .shop-controls{width:100%}.verdant-shop-page .shop-select{flex:1}
      }
    `}</style>

    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f4f5e9]/90 px-5 py-4 backdrop-blur-xl sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between gap-5"><Link href="/" className="text-sm font-extrabold tracking-[0.14em]">VERDANT</Link><nav className="hidden items-center gap-6 text-sm md:flex"><Link href="/" className="opacity-65 hover:opacity-100">Home</Link><span className="font-semibold">Shop</span><Link href="/#collections" className="opacity-65 hover:opacity-100">Collections</Link><Link href="/#care" className="opacity-65 hover:opacity-100">Plant care</Link></nav><Link href="/cart" aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`} className="group inline-flex"><CartIcon count={itemCount} /></Link></div></header>

    <section className="mx-auto max-w-7xl px-5 pb-8 pt-16 sm:px-8 sm:pt-20"><div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between"><div><p className="mb-4 text-[10px] font-black tracking-[0.24em] text-[#52634b]">THE VERDANT SHOP</p><h1 className="max-w-4xl text-5xl font-semibold leading-[.92] tracking-[-.055em] sm:text-7xl">Plants & <span className="font-serif italic font-normal">garden</span> essentials.</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-black/58 sm:text-base">Shop living greens, pots, soil, nutrients, pest control and the tools that help every garden grow.</p></div><div className="rounded-[26px] border border-black/10 bg-white/45 px-5 py-4 shadow-sm"><p className="text-[10px] font-black tracking-[.17em] text-black/42">CMS CATALOG</p><p className="mt-1 text-sm font-semibold text-[#202d20]">Categories update from your admin.</p></div></div></section>

    <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8">
      <div className="shop-category-panel">
        <div className="shop-category-hero">
          <div className="shop-category-hero-content">
            <div className="shop-category-tabs">
              {(["All", "Plants", "Gardening Supplies"] as const).map((value) => <button key={value} type="button" onClick={() => { setType(value); chooseCategory("All"); }} className={`shop-category-tab ${type === value ? "active" : ""}`}>{value}</button>)}
            </div>
            <p className="text-[10px] font-black tracking-[.2em] text-[#ddf27a]">EXPLORE THE COLLECTION</p>
            <h2>Find something <em>good.</em></h2>
            <p className="max-w-[500px] text-xs leading-5 text-[#f4f5e9]/75">Real imagery, clear categories and room to discover every plant and gardening essential in one place.</p>
          </div>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search plants, pots, soil, tools…" className="shop-search" aria-label="Search products" />
        </div>

        <div className="shop-category-body">
          <div className="mb-3 flex items-end justify-between gap-4"><div><p className="text-[10px] font-black tracking-[.18em] text-[#52634b]">SHOP BY CATEGORY</p><p className="mt-1 text-xs text-black/45">Choose a category to browse its subcategories.</p></div><span className="text-[10px] font-bold tracking-[.13em] text-black/38">{visibleCategories.length} categories</span></div>
          <div className="shop-category-rail">
            <button type="button" onClick={() => chooseCategory("All")} className={`shop-category-card ${category === "All" ? "active" : ""}`}>
              <div className="shop-category-photo"><img src="https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=800&q=88" alt="All categories" /></div>
              <div className="shop-category-copy"><strong>All categories</strong><span>Explore everything</span></div>
            </button>
            {visibleCategories.map((item, index) => <button type="button" key={item.id} onClick={() => chooseCategory(item.name)} className={`shop-category-card ${category === item.name || category === item.slug ? "active" : ""}`}>
              <div className="shop-category-photo"><img src={imageForCategory(item, index)} alt={item.name} loading="lazy" /></div>
              <div className="shop-category-copy"><strong>{item.name}</strong><span>{item.description || "Shop this collection"}</span></div>
            </button>)}
          </div>

          {selectedCategory && selectedSubcategories.length > 0 && <div className="shop-subcats"> <button type="button" onClick={() => setSubcategory("All")} className={`shop-subcat ${subcategory === "All" ? "active" : ""}`}>All in {selectedCategory.name}</button>{selectedSubcategories.map((item) => <button type="button" key={item.id} onClick={() => setSubcategory(item.slug)} className={`shop-subcat ${subcategory === item.slug ? "active" : ""}`}>{item.name}</button>)}</div>}

          <div className="shop-control-row">
            <p className="shop-control-note">{selectedCategory ? selectedCategory.description : "Browse plants, planters, growing media, nutrients and garden tools."}</p>
            <div className="shop-controls">
              {["All", "Easy", "Medium"].map((value) => <button key={value} type="button" onClick={() => setLevel(value)} className={`shop-pill ${level === value ? "active" : ""}`}>{value === "All" ? "All care" : value}</button>)}
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="shop-select" aria-label="Sort products"><option value="featured">Featured first</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-[10px] font-black tracking-[.2em] text-[#52634b]">CURATED GREENS & GARDENING</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.03em] sm:text-3xl">Made to be lived with.</h2></div><p className="text-xs font-semibold text-black/45">{filtered.length} selected</p></div>{filtered.length ? <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">{filtered.map((product) => <article key={product.slug} className="group min-w-0"><div className="relative"><Link href={`/shop/${product.slug}`} className="block"><div className="relative aspect-square overflow-hidden rounded-[30px] bg-[#e5eadb] shadow-[0_10px_35px_rgba(32,45,32,.05)] transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_22px_55px_rgba(32,45,32,.13)]"><PlantArtwork product={product} /><span className="absolute left-4 top-4 rounded-full bg-[#f4f5e9]/86 px-3 py-1.5 text-[9px] font-black tracking-[.15em] text-[#202d20] backdrop-blur">{product.product_type || "PLANTS"}</span></div></Link><button type="button" onClick={() => toggleLike(product.slug)} aria-label={`${liked.includes(product.slug) ? "Remove" : "Add"} ${product.name} ${liked.includes(product.slug) ? "from" : "to"} wishlist`} className={`absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-black/8 backdrop-blur-md transition ${liked.includes(product.slug) ? "bg-[#202d20] text-[#ddf27a]" : "bg-[#f4f5e9]/86 text-[#202d20] hover:bg-[#ddf27a]"}`}><HeartIcon filled={liked.includes(product.slug)} /></button></div><div className="pt-4"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-[10px] font-medium tracking-wide text-black/44">{product.category}{product.subcategory ? ` · ${product.subcategory}` : ""}</p><Link href={`/shop/${product.slug}`}><h3 className="mt-1 truncate text-lg font-semibold tracking-[-.03em] hover:underline">{product.name}</h3></Link></div><strong className="shrink-0 text-base">₹{Number(product.price).toLocaleString("en-IN")}</strong></div><p className="mt-2 max-w-sm text-sm leading-6 text-black/52">{product.description}</p><div className="mt-4 flex items-center gap-2"><Link href={`/shop/${product.slug}`} className={`inline-flex h-11 flex-1 items-center justify-center rounded-full text-sm font-bold transition ${product.stock > 0 ? "bg-[#202d20] text-[#f4f5e9] hover:bg-[#101510]" : "cursor-not-allowed bg-black/10 text-black/35"}`}>{product.stock > 0 ? "View item" : "Out of stock"}</Link><button type="button" disabled={product.stock < 1} onClick={() => handleQuickAdd(product)} className={`inline-flex h-11 shrink-0 items-center justify-center rounded-full border px-4 text-sm font-bold transition ${product.stock > 0 ? "border-[#202d20] text-[#202d20] hover:border-[#ddf27a] hover:bg-[#ddf27a]" : "cursor-not-allowed border-black/10 text-black/30"}`}>{quickAdded.includes(product.slug) ? "Added ✓" : "Quick add"}</button></div></div></article>)}</div> : <div className="rounded-3xl border border-black/10 bg-white/50 p-12 text-center"><h2 className="text-2xl font-semibold">Nothing found.</h2><p className="mt-2 text-sm text-black/55">Try another category, subcategory or search.</p><button type="button" onClick={() => { setType("All"); setCategory("All"); setSubcategory("All"); setLevel("All"); setQuery(""); }} className="mt-5 rounded-full bg-[#202d20] px-5 py-3 text-sm font-bold text-white">Clear filters</button></div>}</section>
  </main>;
}
