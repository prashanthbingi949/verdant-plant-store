"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";

type Tone = "moss" | "sage" | "lime";
type DiscoveryProduct = {
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
  image_url?: string | null;
  image_urls?: string[];
};

const fallbackImages: Record<string, string> = {
  "monstera-deliciosa": "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=86",
  "snake-plant": "https://images.unsplash.com/photo-1611211232932-da3113c5b960?auto=format&fit=crop&w=900&q=86",
  "jade-plant": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=86",
  "bird-of-paradise": "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=900&q=86",
  "string-of-pearls": "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=900&q=86",
  lavender: "https://images.unsplash.com/photo-1451336819701-5a83f6534292?auto=format&fit=crop&w=900&q=86",
  "fiddle-leaf-fig": "https://images.unsplash.com/photo-1517191434949-5e90cd67d2b6?auto=format&fit=crop&w=900&q=86",
  "aloe-vera": "https://images.unsplash.com/photo-1513360994626-fc3639d1cc82?auto=format&fit=crop&w=900&q=86",
};

function imageFor(product: DiscoveryProduct) {
  return product.image_url || product.image_urls?.[0] || fallbackImages[product.slug] || null;
}

function plantScore(product: DiscoveryProduct, answers: { light: string; care: string; room: string }) {
  const haystack = `${product.name} ${product.category} ${product.subcategory || ""} ${product.description}`.toLowerCase();
  let score = 0;
  const level = product.level.toLowerCase();
  if (answers.light === "low") score += /snake|zz|pothos|peace|aloe/.test(haystack) ? 4 : 0;
  if (answers.light === "bright") score += /jade|aloe|lavender|bird|monstera|ficus/.test(haystack) ? 4 : 1;
  if (answers.light === "any") score += 1;
  if (answers.care === "easy") score += /easy/.test(level) ? 5 : 1;
  if (answers.care === "some") score += /medium|easy/.test(level) ? 3 : 1;
  if (answers.care === "hands-on") score += /medium|hard|advanced/.test(level) ? 4 : 1;
  if (answers.room === "desk") score += /jade|aloe|snake|string|succulent/.test(haystack) ? 4 : 1;
  if (answers.room === "living") score += /monstera|bird|fiddle|snake/.test(haystack) ? 4 : 1;
  if (answers.room === "balcony") score += /lavender|aloe|succulent|outdoor/.test(haystack) ? 5 : /indoor/.test(product.category.toLowerCase()) ? 0 : 2;
  return score;
}

function Choice({ active, label, description, onClick }: { active: boolean; label: string; description: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`vd-discovery-choice${active ? " is-active" : ""}`}>
      <span className="vd-discovery-choice-dot" aria-hidden="true" />
      <span><strong>{label}</strong><small>{description}</small></span>
    </button>
  );
}

export function FindMyPlant() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ light: "", care: "", room: "" });
  const [products, setProducts] = useState<DiscoveryProduct[]>([]);
  const { addItem } = useCart();
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setProducts(Array.isArray(data?.products) ? data.products.filter((item: DiscoveryProduct) => item.active && item.product_type !== "Gardening Supplies") : []))
      .catch(() => setProducts([]));
  }, []);

  const answerKey = ["light", "care", "room"][step] as "light" | "care" | "room";
  const questions = useMemo(() => [
    { key: "light", title: "How much light does the space get?", options: [["low", "Mostly shade", "A little daylight, not much direct sun"], ["bright", "Bright light", "Plenty of daylight or gentle direct sun"], ["any", "Not sure", "You want something forgiving"]] },
    { key: "care", title: "How involved do you want to be?", options: [["easy", "Keep it easy", "Low-fuss, forgiving care"], ["some", "A little ritual", "Happy to give it regular attention"], ["hands-on", "I love plant care", "You enjoy tuning into your plants"]] },
    { key: "room", title: "Where will it live?", options: [["desk", "Desk / shelf", "Compact, close-up greenery"], ["living", "Living room", "A plant with room-filling presence"], ["balcony", "Balcony / bright corner", "Outdoor-friendly or sun-loving"]] },
  ] as const, []);
  const question = questions[step];
  const ready = answers.light && answers.care && answers.room;
  const results = useMemo(() => products
    .map((product) => ({ product, score: plantScore(product, answers) }))
    .sort((a, b) => b.score - a.score || Number(a.product.price) - Number(b.product.price))
    .slice(0, 3), [answers, products]);

  function choose(value: string) {
    setAnswers((current) => ({ ...current, [answerKey]: value }));
    if (step < 2) setStep((current) => current + 1);
  }

  function add(product: DiscoveryProduct) {
    if (product.stock < 1) return;
    addItem({ id: product.slug, name: product.name, price: Number(product.price), tone: product.tone, size: product.size, category: product.category, image_url: imageFor(product) }, 1);
    setAdded(product.slug);
    window.setTimeout(() => setAdded((current) => current === product.slug ? null : current), 1800);
  }

  return (
    <section className="vd-discovery-find">
      <div className="vd-discovery-inner">
        <div className="vd-discovery-intro">
          <p className="vd-discovery-kicker">FIND MY PLANT</p>
          <h2>Less scrolling.<br /><em>More right plant.</em></h2>
          <p>Answer three quick questions and Verdant will narrow the collection down to plants that fit your light, routine and room.</p>
          <div className="vd-discovery-progress" aria-label={`Question ${Math.min(step + 1, 3)} of 3`}>{[0, 1, 2].map((index) => <span key={index} className={index <= step ? "is-on" : ""} />)}</div>
        </div>

        <div className="vd-discovery-panel">
          {ready ? (
            <>
              <div className="vd-discovery-results-head"><div><p className="vd-discovery-mini">YOUR VERDANT MATCHES</p><h3>Three good places to start.</h3></div><button type="button" onClick={() => { setStep(0); setAnswers({ light: "", care: "", room: "" }); }} className="vd-discovery-reset">Start over</button></div>
              <div className="vd-discovery-results">
                {results.map(({ product, score }, index) => <article key={product.slug} className="vd-discovery-result">
                  <Link href={`/shop/${product.slug}`} className="vd-discovery-result-image">{imageFor(product) ? <img src={imageFor(product)!} alt={product.name} loading="lazy" /> : <span />}</Link>
                  <div className="vd-discovery-result-copy"><span className="vd-discovery-rank">0{index + 1}</span><Link href={`/shop/${product.slug}`}><h4>{product.name}</h4></Link><p>{score >= 10 ? "Strong match" : score >= 7 ? "Good match" : "Worth a look"} · {product.level}</p><small>{product.description}</small><div className="vd-discovery-result-foot"><strong>₹{Number(product.price).toLocaleString("en-IN")}</strong><button type="button" onClick={() => add(product)} disabled={product.stock < 1}>{added === product.slug ? "Added ✓" : product.stock < 1 ? "Out of stock" : "Add to bag"}</button></div></div>
                </article>)}
              </div>
            </>
          ) : (
            <>
              <div className="vd-discovery-question-top"><span>0{step + 1} / 03</span><span>{question.key.toUpperCase()}</span></div>
              <h3>{question.title}</h3>
              <div className="vd-discovery-options">{question.options.map(([value, label, description]) => <Choice key={value} active={answers[answerKey] === value} label={label} description={description} onClick={() => choose(value)} />)}</div>
              {step > 0 && <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} className="vd-discovery-back">← Previous question</button>}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

const moods = [
  { slug: "calm-corner", title: "Calm Corner", text: "Soft greens, quiet shapes and low visual noise.", tags: ["Snake Plant", "Jade Plant"], tint: "#dfe8d5", categorySlug: "indoor-decorative-greens" },
  { slug: "statement-space", title: "Statement Space", text: "Big leaves and confident silhouettes with presence.", tags: ["Monstera", "Bird of Paradise"], tint: "#d4dfca", categorySlug: "indoor-decorative-greens" },
  { slug: "tiny-jungle", title: "Tiny Jungle", text: "Layerable little greens for shelves and desks.", tags: ["Jade Plant", "String of Pearls"], tint: "#e7ead4", categorySlug: "succulents-cacti" },
  { slug: "sunny-balcony", title: "Sunny Balcony", text: "Bright-spot companions that love an open corner.", tags: ["Lavender", "Aloe Vera"], tint: "#e9e6cd", categorySlug: "outdoor-landscape-plants" },
];

export function ShopByMood() {
  return (
    <section className="vd-mood-section">
      <div className="vd-mood-inner">
        <div className="vd-mood-head"><div><p className="vd-discovery-kicker">SHOP BY MOOD</p><h2>Choose the <em>feeling.</em></h2><p>Start with the room you want to create, then let the plants follow.</p></div><Link href="/shop" className="vd-mood-all">Browse the full shop →</Link></div>
        <div className="vd-mood-grid">{moods.map((mood, index) => <Link key={mood.slug} href={`/shop?category=${encodeURIComponent(mood.categorySlug)}`} className="vd-mood-card" style={{ background: mood.tint }}>
          <span className="vd-mood-index">0{index + 1}</span><div><h3>{mood.title}</h3><p>{mood.text}</p><div className="vd-mood-tags">{mood.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><span className="vd-mood-arrow" aria-hidden="true">↗</span>
        </Link>)}</div>
      </div>
    </section>
  );
}
