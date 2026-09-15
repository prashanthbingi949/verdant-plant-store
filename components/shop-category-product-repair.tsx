"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/components/cart-provider";

type Tone = "moss" | "sage" | "lime";
type CatalogProduct = {
  id?: string;
  slug: string;
  name: string;
  category?: string;
  subcategory?: string;
  product_type?: "Plants" | "Gardening Supplies";
  level?: string;
  price: number;
  size?: string;
  description?: string;
  tone?: Tone;
  stock?: number;
  active?: boolean;
  featured?: boolean;
  sort_order?: number;
  image_url?: string | null;
  image_urls?: string[];
};
type CatalogCategory = { id: string; name: string; slug: string; product_type: "Plants" | "Gardening Supplies" };
type CatalogSubcategory = { category_id: string; name: string; slug: string };

type NormalizedProduct = CatalogProduct & {
  canonicalCategory: string;
  canonicalSubcategory: string;
  canonicalType: "Plants" | "Gardening Supplies";
};

const CATEGORY_BY_SLUG: Record<string, { type: "Plants" | "Gardening Supplies"; subcategory: string }> = {
  "monstera-deliciosa": { type: "Plants", subcategory: "monsteras" },
  "snake-plant": { type: "Plants", subcategory: "snake-plants" },
  "jade-plant": { type: "Plants", subcategory: "tabletop-succulents" },
  "bird-of-paradise": { type: "Plants", subcategory: "tropical-plants" },
  "string-of-pearls": { type: "Plants", subcategory: "hanging-succulents" },
  "lavender": { type: "Plants", subcategory: "flowering-shrubs" },
  "fiddle-leaf-fig": { type: "Plants", subcategory: "monsteras" },
  "aloe-vera": { type: "Plants", subcategory: "aloe-vera" },
};

const CATEGORY_ALIASES: Record<string, string> = {
  "indoor plants": "indoor-decorative-greens",
  "indoor & decorative greens": "indoor-decorative-greens",
  "outdoor plants": "outdoor-landscape-plants",
  "outdoor & landscape plants": "outdoor-landscape-plants",
  succulents: "succulents-cacti",
  "succulents & cacti": "succulents-cacti",
};

const FALLBACK_CATEGORY_PRODUCTS: NormalizedProduct[] = [
  {
    slug: "tomato-sapling", name: "Tomato Sapling", category: "Fruit & Vegetable Saplings", subcategory: "vegetable-saplings", product_type: "Plants",
    level: "Easy care", price: 299, size: "grow bag", description: "A healthy starter sapling for balconies, terraces and kitchen gardens.", tone: "lime", stock: 20, active: true, canonicalCategory: "fruit-vegetable-saplings", canonicalSubcategory: "vegetable-saplings", canonicalType: "Plants",
  },
  {
    slug: "marigold-bloom", name: "Marigold Bloom", category: "Seasonal & Flowering Plants", subcategory: "seasonal-bloomers", product_type: "Plants",
    level: "Easy care", price: 249, size: "6\" pot", description: "A cheerful flowering plant for sunny balconies and garden edges.", tone: "lime", stock: 20, active: true, canonicalCategory: "seasonal-flowering-plants", canonicalSubcategory: "seasonal-bloomers", canonicalType: "Plants",
  },
  {
    slug: "terracotta-planter", name: "Terracotta Planter", category: "Pots & Planters", subcategory: "terracotta", product_type: "Gardening Supplies",
    level: "Everyday", price: 499, size: "8\"", description: "A breathable terracotta planter for everyday repotting and display.", tone: "moss", stock: 30, active: true, canonicalCategory: "pots-planters", canonicalSubcategory: "terracotta", canonicalType: "Gardening Supplies",
  },
  {
    slug: "premium-potting-mix", name: "Premium Potting Mix", category: "Soil & Growing Media", subcategory: "potting-mix", product_type: "Gardening Supplies",
    level: "Everyday", price: 399, size: "5 kg", description: "A balanced growing medium for common indoor and outdoor plants.", tone: "sage", stock: 30, active: true, canonicalCategory: "soil-growing-media", canonicalSubcategory: "potting-mix", canonicalType: "Gardening Supplies",
  },
  {
    slug: "organic-plant-food", name: "Organic Plant Food", category: "Fertilizers & Nutrients", subcategory: "organic-manure", product_type: "Gardening Supplies",
    level: "Everyday", price: 449, size: "1 L", description: "An easy-to-use nutrient boost for growing plants and garden beds.", tone: "lime", stock: 30, active: true, canonicalCategory: "fertilizers-nutrients", canonicalSubcategory: "organic-manure", canonicalType: "Gardening Supplies",
  },
  {
    slug: "neem-shield", name: "Neem Shield", category: "Pest Control", subcategory: "neem-oil", product_type: "Gardening Supplies",
    level: "Everyday", price: 299, size: "250 ml", description: "Neem-based plant care for routine pest-management needs.", tone: "sage", stock: 30, active: true, canonicalCategory: "pest-control", canonicalSubcategory: "neem-oil", canonicalType: "Gardening Supplies",
  },
  {
    slug: "garden-pruner", name: "Garden Pruner", category: "Tools & Equipment", subcategory: "pruners", product_type: "Gardening Supplies",
    level: "Everyday", price: 599, size: "one tool", description: "A compact hand pruner for clean everyday garden cuts.", tone: "moss", stock: 30, active: true, canonicalCategory: "tools-equipment", canonicalSubcategory: "pruners", canonicalType: "Gardening Supplies",
  },
];

const IMAGE_MAP: Record<string, string> = {
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

function canonicalCategory(product: CatalogProduct) {
  const slugAlias = CATEGORY_BY_SLUG[product.slug]?.type === "Plants" ? CATEGORY_ALIASES[String(product.category || "").trim().toLowerCase()] : undefined;
  const raw = String(product.category || "").trim().toLowerCase();
  return CATEGORY_ALIASES[raw] || slugAlias || raw.replace(/\s+/g, "-");
}

function normalizeProduct(product: CatalogProduct): NormalizedProduct {
  const rawCategory = String(product.category || "").trim().toLowerCase();
  const mappedSlug = CATEGORY_BY_SLUG[product.slug];
  const categorySlug = CATEGORY_ALIASES[rawCategory] || rawCategory.replace(/\s+/g, "-");
  const canonicalCategorySlug = mappedSlug && product.slug !== "lavender"
    ? ({ "monstera-deliciosa": "indoor-decorative-greens", "snake-plant": "indoor-decorative-greens", "jade-plant": "succulents-cacti", "bird-of-paradise": "indoor-decorative-greens", "string-of-pearls": "succulents-cacti", "fiddle-leaf-fig": "indoor-decorative-greens", "aloe-vera": "succulents-cacti" } as Record<string, string>)[product.slug] || categorySlug
    : product.slug === "lavender" ? "outdoor-landscape-plants" : categorySlug;
  return {
    ...product,
    canonicalCategory: canonicalCategorySlug,
    canonicalSubcategory: product.subcategory || mappedSlug?.subcategory || "",
    canonicalType: product.product_type || mappedSlug?.type || "Plants",
  };
}

function imageFor(product: NormalizedProduct) {
  return product.image_url || product.image_urls?.[0] || IMAGE_MAP[product.slug] || null;
}

export default function ShopCategoryProductRepair() {
  const { addItem } = useCart();
  const [mounted, setMounted] = useState(false);
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [products, setProducts] = useState<NormalizedProduct[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [subcategories, setSubcategories] = useState<CatalogSubcategory[]>([]);
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
      const liveProducts = Array.isArray(productData?.products) ? productData.products.map(normalizeProduct) : [];
      setProducts(liveProducts);
      setCategories(Array.isArray(catalogData?.categories) ? catalogData.categories.filter((item: CatalogCategory) => item.active) : []);
      setSubcategories(Array.isArray(catalogData?.subcategories) ? catalogData.subcategories.filter((item: CatalogSubcategory) => item.active) : []);
    }).catch(() => {});

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const page = document.querySelector<HTMLElement>(".verdant-shop-page");
    if (!page) return;
    const section = Array.from(page.querySelectorAll("section")).find((candidate) => candidate.textContent?.includes("Made to be lived with."));
    if (!section) return;
    let target = section.querySelector<HTMLElement>("[data-shop-category-repair]");
    if (!target) {
      target = document.createElement("div");
      target.dataset.shopCategoryRepair = "true";
      section.appendChild(target);
    }
    setMount(target);

    const categoryFromButton = (button: HTMLElement) => {
      const label = button.querySelector("strong")?.textContent?.trim() || button.textContent?.trim() || "";
      return categories.find((item) => item.name.toLowerCase() === label.toLowerCase())?.slug || CATEGORY_ALIASES[label.toLowerCase()] || "All";
    };

    const onClick = (event: MouseEvent) => {
      const targetElement = event.target as HTMLElement | null;
      const categoryButton = targetElement?.closest<HTMLElement>(".shop-category-card");
      const subcategoryButton = targetElement?.closest<HTMLElement>(".shop-subcat");
      const typeButton = targetElement?.closest<HTMLElement>(".shop-category-tab");
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
        setSelectedType("All");
        setSelectedCategory(categoryFromButton(categoryButton));
        setSelectedSubcategory("All");
      }
      if (subcategoryButton) {
        const label = subcategoryButton.textContent?.trim() || "All";
        if (/^All in /i.test(label)) {
          setSelectedCategory(label.replace(/^All in /i, "").trim().toLowerCase().replace(/\s+/g, "-") || "All");
          setSelectedSubcategory("All");
        } else {
          const selected = categories.find((item) => item.slug === selectedCategory);
          const found = subcategories.find((item) => item.category_id === selected?.id && item.name.toLowerCase() === label.toLowerCase());
          setSelectedSubcategory(found?.slug || label.toLowerCase().replace(/\s+/g, "-"));
        }
      }
    };

    page.addEventListener("click", onClick);
    return () => page.removeEventListener("click", onClick);
  }, [categories, mounted, selectedCategory, subcategories]);

  const effectiveProducts = useMemo(() => {
    const seen = new Set(products.map((product) => product.slug));
    const additions = FALLBACK_CATEGORY_PRODUCTS.filter((product) => !seen.has(product.slug));
    return [...products, ...additions];
  }, [products]);

  const selectedCategorySlug = useMemo(() => {
    if (selectedCategory === "All") return "All";
    const direct = categories.find((item) => item.slug === selectedCategory || item.name === selectedCategory);
    return direct?.slug || CATEGORY_ALIASES[selectedCategory.toLowerCase()] || selectedCategory;
  }, [categories, selectedCategory]);

  const filtered = useMemo(() => {
    const list = effectiveProducts.filter((product) => product.active !== false);
    const typeFiltered = selectedType === "All" ? list : list.filter((product) => product.canonicalType === selectedType);
    const categoryFiltered = selectedCategorySlug === "All" ? typeFiltered : typeFiltered.filter((product) => product.canonicalCategory === selectedCategorySlug);
    if (selectedSubcategory === "All") return categoryFiltered;
    return categoryFiltered.filter((product) => product.canonicalSubcategory === selectedSubcategory);
  }, [effectiveProducts, selectedCategorySlug, selectedSubcategory, selectedType]);

  const visible = selectedCategorySlug !== "All" || selectedType !== "All";

  if (!mounted || !mount) return null;

  return createPortal(
    <section className={`shop-category-repair ${visible ? "is-visible" : ""}`} aria-label="Category products">
      <style>{`\n        .shop-category-repair{display:none;padding:8px 0 8px}.shop-category-repair.is-visible{display:block}.shop-category-repair-head{display:flex;justify-content:space-between;align-items:end;gap:18px;margin-bottom:24px}.shop-category-repair-kicker{margin:0 0 6px;font-size:10px;font-weight:900;letter-spacing:.18em;color:#52634b}.shop-category-repair-title{margin:0;font-size:clamp(28px,4vw,46px);line-height:.95;letter-spacing:-.05em}.shop-category-repair-count{font-size:11px;color:rgba(16,21,16,.45)}.shop-category-repair-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.shop-category-repair-card{min-width:0}.shop-category-repair-media{display:block;aspect-ratio:1;border-radius:22px;overflow:hidden;background:#e7ecdf;border:1px solid rgba(16,21,16,.08)}.shop-category-repair-media img{width:100%;height:100%;object-fit:cover;display:block}.shop-category-repair-copy{display:flex;justify-content:space-between;gap:12px;align-items:start;padding:12px 2px 0}.shop-category-repair-copy h3{margin:3px 0 0;font-size:17px;letter-spacing:-.03em}.shop-category-repair-copy p{margin:0;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:rgba(16,21,16,.42)}.shop-category-repair-price{font-size:14px;font-weight:850;white-space:nowrap}.shop-category-repair-actions{display:flex;gap:8px;margin-top:10px}.shop-category-repair-actions a,.shop-category-repair-actions button{flex:1;min-height:40px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:850}.shop-category-repair-actions a{background:#f4f5e9;border:1px solid rgba(16,21,16,.12)}.shop-category-repair-actions button{background:#202d20;color:#f4f5e9}.shop-category-repair-empty{padding:52px 18px;text-align:center;border:1px dashed rgba(16,21,16,.15);border-radius:24px;color:rgba(16,21,16,.55)}@media(max-width:980px){.shop-category-repair-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:640px){.shop-category-repair-head{align-items:start;flex-direction:column}.shop-category-repair-grid{grid-template-columns:1fr;gap:22px}.shop-category-repair-media{aspect-ratio:1.05}.shop-category-repair-copy h3{font-size:18px}}\n      `}</style>
      <div className="shop-category-repair-head">
        <div><p className="shop-category-repair-kicker">RELATED PRODUCTS</p><h2 className="shop-category-repair-title">{selectedCategorySlug === "All" ? selectedType : categories.find((item) => item.slug === selectedCategorySlug)?.name || "Category"}</h2></div>
        <span className="shop-category-repair-count">{filtered.length} products</span>
      </div>
      {filtered.length ? <div className="shop-category-repair-grid">{filtered.map((product) => {
        const image = imageFor(product);
        return <article className="shop-category-repair-card" key={`${selectedCategorySlug}-${product.slug}`}>
          <a className="shop-category-repair-media" href={`/shop/${product.slug}`} aria-label={`View ${product.name}`}>
            {image ? <img src={image} alt={product.name} /> : <div className="grid h-full place-items-center text-xs font-bold text-black/35">Verdant</div>}
          </a>
          <div className="shop-category-repair-copy"><div><p>{product.category || product.canonicalCategory}</p><h3>{product.name}</h3></div><span className="shop-category-repair-price">₹{Number(product.price).toLocaleString("en-IN")}</span></div>
          <div className="shop-category-repair-actions"><a href={`/shop/${product.slug}`}>View</a><button type="button" onClick={() => addItem({ id: product.slug, name: product.name, price: Number(product.price), tone: product.tone || "moss", size: product.size || "Standard", category: product.category || product.canonicalCategory, image_url: image }, 1)}>Add to cart</button></div>
        </article>;
      })}</div> : <div className="shop-category-repair-empty">No products are assigned to this subcategory yet.</div>}
    </section>,
    mount,
  );
}
