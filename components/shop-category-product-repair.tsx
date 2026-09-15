"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/components/cart-provider";

type Tone = "moss" | "sage" | "lime";
type Product = {
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  product_type?: "Plants" | "Gardening Supplies";
  price: number;
  size?: string;
  description?: string;
  tone?: Tone;
  stock?: number;
  active?: boolean;
  image_url?: string | null;
};
type Category = { id: string; name: string; slug: string; product_type: "Plants" | "Gardening Supplies"; active?: boolean };
type Subcategory = { category_id: string; name: string; slug: string; active?: boolean };

const ALIASES: Record<string, string> = {
  "indoor plants": "indoor-decorative-greens",
  "indoor & decorative greens": "indoor-decorative-greens",
  "outdoor plants": "outdoor-landscape-plants",
  "outdoor & landscape plants": "outdoor-landscape-plants",
  succulents: "succulents-cacti",
  "succulents & cacti": "succulents-cacti",
};

const CATEGORY_BY_SLUG: Record<string, { category: string; subcategory: string; type: "Plants" | "Gardening Supplies" }> = {
  "monstera-deliciosa": { category: "indoor-decorative-greens", subcategory: "monsteras", type: "Plants" },
  "snake-plant": { category: "indoor-decorative-greens", subcategory: "snake-plants", type: "Plants" },
  "jade-plant": { category: "succulents-cacti", subcategory: "tabletop-succulents", type: "Plants" },
  "bird-of-paradise": { category: "indoor-decorative-greens", subcategory: "tropical-plants", type: "Plants" },
  "string-of-pearls": { category: "succulents-cacti", subcategory: "hanging-succulents", type: "Plants" },
  lavender: { category: "outdoor-landscape-plants", subcategory: "flowering-shrubs", type: "Plants" },
  "fiddle-leaf-fig": { category: "indoor-decorative-greens", subcategory: "monsteras", type: "Plants" },
  "aloe-vera": { category: "succulents-cacti", subcategory: "aloe-vera", type: "Plants" },
};

const EXTRA_PRODUCTS: Product[] = [
  { slug: "tomato-sapling", name: "Tomato Sapling", category: "Fruit & Vegetable Saplings", subcategory: "vegetable-saplings", product_type: "Plants", price: 299, size: "grow bag", description: "Healthy starter sapling for balconies, terraces and kitchen gardens.", tone: "lime", stock: 20, active: true },
  { slug: "marigold-bloom", name: "Marigold Bloom", category: "Seasonal & Flowering Plants", subcategory: "seasonal-bloomers", product_type: "Plants", price: 249, size: "6\" pot", description: "A cheerful flowering plant for sunny balconies and garden edges.", tone: "lime", stock: 20, active: true },
  { slug: "terracotta-planter", name: "Terracotta Planter", category: "Pots & Planters", subcategory: "terracotta", product_type: "Gardening Supplies", price: 499, size: "8\"", description: "A breathable terracotta planter for everyday repotting and display.", tone: "moss", stock: 30, active: true },
  { slug: "premium-potting-mix", name: "Premium Potting Mix", category: "Soil & Growing Media", subcategory: "potting-mix", product_type: "Gardening Supplies", price: 399, size: "5 kg", description: "A balanced growing medium for common indoor and outdoor plants.", tone: "sage", stock: 30, active: true },
  { slug: "organic-plant-food", name: "Organic Plant Food", category: "Fertilizers & Nutrients", subcategory: "organic-manure", product_type: "Gardening Supplies", price: 449, size: "1 L", description: "An easy nutrient boost for growing plants and garden beds.", tone: "lime", stock: 30, active: true },
  { slug: "neem-shield", name: "Neem Shield", category: "Pest Control", subcategory: "neem-oil", product_type: "Gardening Supplies", price: 299, size: "250 ml", description: "Neem-based plant care for routine pest-management needs.", tone: "sage", stock: 30, active: true },
  { slug: "garden-pruner", name: "Garden Pruner", category: "Tools & Equipment", subcategory: "pruners", product_type: "Gardening Supplies", price: 599, size: "one tool", description: "A compact hand pruner for clean everyday garden cuts.", tone: "moss", stock: 30, active: true },
];

const IMAGES: Record<string, string> = {
  "monstera-deliciosa": "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1000&q=88",
  "snake-plant": "https://images.unsplash.com/photo-1611211232932-da3113c5b960?auto=format&fit=crop&w=1000&q=88",
  "jade-plant": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=88",
  "bird-of-paradise": "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=1000&q=88",
  "string-of-pearls": "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=1000&q=88",
  lavender: "https://images.unsplash.com/photo-1451336819701-5a83f6534292?auto=format&fit=crop&w=1000&q=88",
  "fiddle-leaf-fig": "https://images.unsplash.com/photo-1517191434949-5e90cd67d2b6?auto=format&fit=crop&w=1000&q=88",
  "aloe-vera": "https://images.unsplash.com/photo-1513360994626-fc3639d1cc82?auto=format&fit=crop&w=1000&q=88",
  "tomato-sapling": "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1000&q=88",
  "marigold-bloom": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=88",
  "terracotta-planter": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=88",
  "premium-potting-mix": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1000&q=88",
  "organic-plant-food": "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=1000&q=88",
  "neem-shield": "https://images.unsplash.com/photo-1621460248083-6271cc4437a8?auto=format&fit=crop&w=1000&q=88",
  "garden-pruner": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1000&q=88",
};

function categorySlug(value: string) {
  const raw = value.trim().toLowerCase();
  return ALIASES[raw] || raw.replace(/\s+/g, "-");
}

function canonical(product: Product) {
  const mapped = CATEGORY_BY_SLUG[product.slug];
  return {
    category: mapped?.category || categorySlug(product.category),
    subcategory: product.subcategory || mapped?.subcategory || "",
    type: product.product_type || mapped?.type || "Plants",
  };
}

function imageFor(product: Product) {
  return product.image_url || IMAGES[product.slug] || null;
}

export default function ShopCategoryProductRepair() {
  const { addItem } = useCart();
  const [mounted, setMounted] = useState(false);
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [selectedType, setSelectedType] = useState<"All" | "Plants" | "Gardening Supplies">("All");

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("category");
    const requestedType = params.get("type");
    if (requested) setSelectedCategory(requested);
    if (requestedType === "Plants" || requestedType === "Gardening Supplies") setSelectedType(requestedType);

    let cancelled = false;
    Promise.all([
      fetch("/api/products", { cache: "no-store" }).then((r) => r.ok ? r.json() : null),
      fetch("/api/cms/catalog", { cache: "no-store" }).then((r) => r.ok ? r.json() : null),
    ]).then(([productData, catalogData]) => {
      if (cancelled) return;
      const live = Array.isArray(productData?.products) ? productData.products : [];
      const seen = new Set(live.map((item: Product) => item.slug));
      setProducts([...live, ...EXTRA_PRODUCTS.filter((item) => !seen.has(item.slug))]);
      setCategories(Array.isArray(catalogData?.categories) ? catalogData.categories.filter((item: Category) => item.active !== false) : []);
      setSubcategories(Array.isArray(catalogData?.subcategories) ? catalogData.subcategories.filter((item: Subcategory) => item.active !== false) : []);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const page = document.querySelector<HTMLElement>(".verdant-shop-page");
    if (!page) return;
    const section = Array.from(page.querySelectorAll("section")).find((item) => item.textContent?.includes("Made to be lived with."));
    if (!section) return;
    let target = section.querySelector<HTMLElement>("[data-shop-category-repair]");
    if (!target) {
      target = document.createElement("div");
      target.dataset.shopCategoryRepair = "true";
      section.appendChild(target);
    }
    setMount(target);

    const onClick = (event: MouseEvent) => {
      const el = event.target as HTMLElement | null;
      const typeButton = el?.closest<HTMLElement>(".shop-category-tab");
      const categoryButton = el?.closest<HTMLElement>(".shop-category-card");
      const subButton = el?.closest<HTMLElement>(".shop-subcat");
      if (typeButton) {
        const label = typeButton.textContent?.trim();
        if (label === "Plants" || label === "Gardening Supplies") {
          setSelectedType(label);
          setSelectedCategory("All");
          setSelectedSubcategory("All");
        } else if (label === "All") {
          setSelectedType("All");
          setSelectedCategory("All");
          setSelectedSubcategory("All");
        }
      }
      if (categoryButton) {
        const label = categoryButton.querySelector("strong")?.textContent?.trim() || categoryButton.textContent?.trim() || "";
        const selected = categories.find((item) => item.name.toLowerCase() === label.toLowerCase());
        setSelectedType("All");
        setSelectedCategory(selected?.slug || categorySlug(label));
        setSelectedSubcategory("All");
      }
      if (subButton) {
        const label = subButton.textContent?.trim() || "";
        if (/^All in /i.test(label)) {
          setSelectedCategory(categorySlug(label.replace(/^All in /i, "")));
          setSelectedSubcategory("All");
        } else {
          setSelectedSubcategory(categorySlug(label));
        }
      }
    };
    page.addEventListener("click", onClick);
    return () => page.removeEventListener("click", onClick);
  }, [categories, mounted]);

  const selectedCategorySlug = selectedCategory === "All" ? "All" : (categories.find((item) => item.slug === selectedCategory || item.name === selectedCategory)?.slug || ALIASES[selectedCategory.toLowerCase()] || categorySlug(selectedCategory));
  const selectedCategoryRecord = categories.find((item) => item.slug === selectedCategorySlug);
  const selectedSubcategoryRecord = selectedCategoryRecord ? subcategories.find((item) => item.category_id === selectedCategoryRecord.id && (item.slug === selectedSubcategory || item.name.toLowerCase() === selectedSubcategory.toLowerCase())) : null;

  const filtered = useMemo(() => {
    if (selectedCategorySlug === "All" && selectedType === "All") return [];
    return products.filter((product) => {
      if (product.active === false) return false;
      const normalized = canonical(product);
      const typeMatch = selectedType === "All" || normalized.type === selectedType;
      const categoryMatch = selectedCategorySlug === "All" || normalized.category === selectedCategorySlug;
      const subMatch = selectedSubcategory === "All" || normalized.subcategory === (selectedSubcategoryRecord?.slug || selectedSubcategory);
      return typeMatch && categoryMatch && subMatch;
    });
  }, [products, selectedCategorySlug, selectedSubcategory, selectedSubcategoryRecord, selectedType]);

  if (!mounted || !mount) return null;

  const title = selectedCategorySlug === "All" ? selectedType : categories.find((item) => item.slug === selectedCategorySlug)?.name || "Category";

  return createPortal(
    <section className="shop-category-repair is-visible" aria-label="Related category products">
      <style>{`.shop-category-repair{padding:10px 0 24px}.shop-category-repair-head{display:flex;justify-content:space-between;align-items:end;gap:16px;margin-bottom:22px}.shop-category-repair-kicker{margin:0 0 5px;font-size:10px;font-weight:900;letter-spacing:.18em;color:#52634b}.shop-category-repair-title{margin:0;font-size:clamp(28px,4vw,46px);line-height:.95;letter-spacing:-.05em}.shop-category-repair-count{font-size:11px;color:rgba(16,21,16,.45)}.shop-category-repair-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.shop-category-repair-card{min-width:0}.shop-category-repair-media{display:block;aspect-ratio:1;border-radius:22px;overflow:hidden;background:#e7ecdf;border:1px solid rgba(16,21,16,.08)}.shop-category-repair-media img{width:100%;height:100%;object-fit:cover;display:block}.shop-category-repair-copy{display:flex;justify-content:space-between;gap:12px;align-items:start;padding:12px 2px 0}.shop-category-repair-copy h3{margin:3px 0 0;font-size:17px;letter-spacing:-.03em}.shop-category-repair-copy p{margin:0;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:rgba(16,21,16,.42)}.shop-category-repair-price{font-size:14px;font-weight:850;white-space:nowrap}.shop-category-repair-actions{margin-top:10px}.shop-category-repair-actions button{width:100%;min-height:40px;border:0;border-radius:999px;background:#202d20;color:#f4f5e9;font-size:10px;font-weight:850}.shop-category-repair-empty{padding:46px 18px;text-align:center;border:1px dashed rgba(16,21,16,.15);border-radius:24px;color:rgba(16,21,16,.55)}@media(max-width:980px){.shop-category-repair-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:640px){.shop-category-repair-head{align-items:start;flex-direction:column}.shop-category-repair-grid{grid-template-columns:1fr;gap:22px}.shop-category-repair-media{aspect-ratio:1.05}}`}</style>
      <div className="shop-category-repair-head"><div><p className="shop-category-repair-kicker">RELATED PRODUCTS</p><h2 className="shop-category-repair-title">{title}</h2></div><span className="shop-category-repair-count">{filtered.length} products</span></div>
      {filtered.length ? <div className="shop-category-repair-grid">{filtered.map((product) => { const image = imageFor(product); return <article className="shop-category-repair-card" key={`${selectedCategorySlug}-${product.slug}`}><div className="shop-category-repair-media">{image ? <img src={image} alt={product.name} /> : <div className="grid h-full place-items-center text-xs font-bold text-black/35">Verdant</div>}</div><div className="shop-category-repair-copy"><div><p>{product.category}</p><h3>{product.name}</h3></div><span className="shop-category-repair-price">₹{Number(product.price).toLocaleString("en-IN")}</span></div><div className="shop-category-repair-actions"><button type="button" onClick={() => addItem({ id: product.slug, name: product.name, price: Number(product.price), tone: product.tone || "moss", size: product.size || "Standard", category: product.category, image_url: image }, 1)}>Add to cart</button></div></article>; })}</div> : <div className="shop-category-repair-empty">No products are assigned to this selection yet.</div>}
    </section>,
    mount,
  );
}
