"use client";

import Link from "next/link";
import VerdantSpotlightHero from "@/components/verdant-spotlight-hero";
import { useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/components/cart-provider";

const collections = [
  { eyebrow: "01 / EASY CARE", title: "Indoor plants", note: "Calm, green companions for every room." },
  { eyebrow: "02 / SUN LOVERS", title: "Outdoor plants", note: "Bring a little wildness to balconies and gardens." },
  { eyebrow: "03 / MINIATURE", title: "Succulents", note: "Small shapes with a lot of personality." },
];

const products = [
  { id: "monstera-deliciosa", name: "Monstera Deliciosa", meta: "Statement plant · 12\\" pot", price: 1899, tone: "moss" as const, size: "12\\" pot", category: "Indoor plants" },
  { id: "snake-plant", name: "Snake Plant", meta: "Low light · 10\\" pot", price: 899, tone: "sage" as const, size: "10\\" pot", category: "Indoor plants" },
  { id: "jade-plant", name: "Jade Plant", meta: "Desk friendly · 6\\" pot", price: 649, tone: "lime" as const, size: "6\\" pot", category: "Succulents" },
];

function LeafMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M38.4 7.2C24.2 8.4 12 15.1 9.6 27.4c-1.2 6.2 1.8 11.1 7 12.1 8.2 1.5 16.7-5.2 19.1-13.7 1.5-5.2 1.6-11 2.7-18.6Z" fill="currentColor" />
      <path d="M10.4 38.1c6.2-8.2 12-13 21.2-17.6" fill="none" stroke="var(--cream)" strokeWidth="2" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

function BotanicalShape({ tone }: { tone: string }) {
  return (
    <div className={`botanical-card botanical-${tone}`}>
      <div className="botanical-glow" />
      <svg viewBox="0 0 420 360" className="plant-art" aria-hidden="true">
        <path d="M205 318c9-48 9-94 0-143" fill="none" stroke="var(--forest)" strokeWidth="7" strokeLinecap="round" />
        <path d="M205 216c-39-42-74-55-116-43 13 40 49 69 116 43Z" fill="var(--leaf)" />
        <path d="M211 183c28-55 68-81 119-79 4 49-26 91-119 79Z" fill="var(--leaf-deep)" />
        <path d="M202 254c-52-26-92-18-119 16 33 29 75 31 119-16Z" fill="var(--leaf-soft)" />
        <path d="M210 272c36-42 75-50 114-34-11 39-48 64-114 34Z" fill="var(--leaf)" />
        <path d="M207 151c-13-49 3-87 42-113 25 37 15 77-42 113Z" fill="var(--lime)" />
        <path d="M176 318c-12 16-16 24-16 29h92c-1-5-5-13-16-29H176Z" fill="var(--pot)" />
        <path d="M165 346h102" stroke="var(--forest)" strokeWidth="7" strokeLinecap="round" opacity=".45" />
      </svg>
      <span className="plant-spark spark-one" />
      <span className="plant-spark spark-two" />
    </div>
  );
}

function Icon({ name }: { name: "heart" | "arrow" }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "heart") return <svg {...common}><path d="M20.8 8.8c0 5.1-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" /></svg>;
  return <svg {...common}><path d="M5 12h13" /><path d="m13 7 5 5-5 5" /></svg>;
}

export default function Home() {
  const { addItem } = useCart();
  const [liked, setLiked] = useState<number[]>([]);
  const [added, setAdded] = useState<number[]>([]);

  const toggleLike = (index: number) => setLiked((items) => items.includes(index) ? items.filter((item) => item !== index) : [...items, index]);

  const handleAdd = (index: number) => {
    const product = products[index];
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      tone: product.tone,
      size: product.size,
      category: product.category,
      image_url: null,
    }, 1);
    setAdded((items) => items.includes(index) ? items : [...items, index]);
  };

  return (
    <main className="verdant-site">
      <VerdantSpotlightHero />

      <section className="marquee"><div>PLANT MORE JOY · PLANT MORE JOY · PLANT MORE JOY · PLANT MORE JOY · </div></section>

      <section className="section collections-section" id="collections"><div className="section-heading"><div><p className="eyebrow">THE VERDANT EDIT</p><h2>Choose your <em>green.</em></h2></div><p>From first-time plant parents to lifelong gardeners, there is a little something growing here for everyone.</p></div><div className="collection-grid">{collections.map((item, index) => <motion.a href="/shop" className="collection-card" key={item.title} whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 280, damping: 22 }}><div className="collection-copy"><span>{item.eyebrow}</span><h3>{item.title}</h3><p>{item.note}</p><span className="round-arrow"><Icon name="arrow" /></span></div><div className={`collection-art art-${index + 1}`}><BotanicalShape tone={`collection-${index + 1}`} /></div></motion.a>)}</div></section>

      <section className="section shop-section" id="shop"><div className="section-heading compact"><div><p className="eyebrow">MOST LOVED</p><h2>Little <em>legends.</em></h2></div><Link className="text-link" href="/shop">View all plants <Icon name="arrow" /></Link></div><div className="product-grid">{products.map((product, index) => <article className="product-card" key={product.name}><div className="product-image"><button type="button" className={`wish ${liked.includes(index) ? "is-liked" : ""}`} onClick={() => toggleLike(index)} aria-label={`Wishlist ${product.name}`}><Icon name="heart" /></button><Link href={`/shop/${product.id}`} className="block h-full"><BotanicalShape tone={product.tone} /></Link><span className="product-badge">BEST SELLER</span></div><div className="product-info"><div><p>{product.meta}</p><Link href={`/shop/${product.id}`}><h3>{product.name}</h3></Link></div><div className="product-buy"><strong>₹{product.price.toLocaleString("en-IN")}</strong><button type="button" onClick={() => handleAdd(index)}>{added.includes(index) ? "Added ✓" : "Add +"}</button></div></div></article>)}</div></section>

      <section className="story-section" id="story"><div className="story-art"><div className="story-card"><span>EST. 2026</span><div className="story-circle"><LeafMark /></div><strong>Good things<br />take root.</strong></div><span className="story-stem" /></div><div className="story-copy"><p className="eyebrow">THE VERDANT WAY</p><h2>More than a store.<br /><em>A little ritual.</em></h2><p>We believe plants change a room, then slowly change the way the room feels. Verdant is a place for that transformation — one stem, one pot, one sunny corner at a time.</p><a className="button button-dark" href="#care">Explore plant care <Icon name="arrow" /></a></div></section>

      <section className="care-section" id="care"><div className="care-heading"><p className="eyebrow">PLANT CARE, MADE SIMPLE</p><h2>Less guesswork.<br /><em>More growing.</em></h2><p>Practical guides for water, light, soil and everything in between.</p></div><div className="care-list"><a href="#care"><span>01</span><strong>Watering without overthinking</strong><Icon name="arrow" /></a><a href="#care"><span>02</span><strong>Finding the right light</strong><Icon name="arrow" /></a><a href="#care"><span>03</span><strong>Repotting, root to leaf</strong><Icon name="arrow" /></a><a href="#care"><span>04</span><strong>Build your own green corner</strong><Icon name="arrow" /></a></div></section>

      <section className="newsletter" id="newsletter"><div><p className="eyebrow">A NOTE FROM VERDANT</p><h2>Grow slowly.<br /><em>Stay curious.</em></h2></div><form onSubmit={(event) => event.preventDefault()}><label htmlFor="email">Plant tips, new arrivals and good things — occasionally.</label><div className="email-row"><input id="email" type="email" placeholder="Your email address" required /><button className="button button-lime" type="submit">Join us <Icon name="arrow" /></button></div></form></section>

      <footer className="footer" id="account"><div className="footer-brand"><Link className="brand light" href="/"><span className="brand-mark"><LeafMark /></span><span>VERDANT</span></Link><p>Thoughtful plants and beautiful objects for a greener everyday.</p></div><div className="footer-col"><span>SHOP</span><Link href="/shop">Indoor plants</Link><Link href="/shop">Succulents</Link><Link href="/shop">Planters</Link><Link href="#care">Plant care</Link></div><div className="footer-col"><span>ABOUT</span><Link href="#story">Our story</Link><Link href="#care">Care journal</Link><Link href="#newsletter">Account</Link><Link href="#newsletter">Contact</Link></div><div className="footer-end"><span>© 2026 VERDANT</span><span>MADE FOR SLOW GROWERS</span></div></footer>
    </main>
  );
}
