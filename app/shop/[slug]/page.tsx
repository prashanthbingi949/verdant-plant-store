import { notFound } from "next/navigation";
import ProductDetails from "@/components/product-details";

const catalog = {
  "monstera-deliciosa": {
    name: "Monstera Deliciosa",
    category: "Indoor plants",
    price: 1899,
    level: "Easy care",
    size: "12\" pot",
    description: "A lush statement plant with generous split leaves. Monstera brings a calm tropical character to bright living spaces and grows beautifully with a little patience.",
    details: [["Light", "Bright, indirect light"], ["Water", "When the top 2–3 cm of soil dries"], ["Humidity", "Medium to high"], ["Pet note", "Keep away from curious pets"]],
    tone: "moss" as const,
  },
  "snake-plant": {
    name: "Snake Plant",
    category: "Indoor plants",
    price: 899,
    level: "Easy care",
    size: "10\" pot",
    description: "Architectural, resilient and comfortable in lower light. A dependable first plant with a clean silhouette that works almost anywhere.",
    details: [["Light", "Low to bright indirect light"], ["Water", "Let soil dry between waterings"], ["Humidity", "Low to medium"], ["Pet note", "Keep away from pets"]],
    tone: "sage" as const,
  },
  "jade-plant": {
    name: "Jade Plant",
    category: "Succulents",
    price: 649,
    level: "Easy care",
    size: "6\" pot",
    description: "A compact succulent with glossy leaves and a naturally sculptural form. Made for sunny desks, shelves and windowsills.",
    details: [["Light", "Bright light with gentle sun"], ["Water", "Allow soil to dry fully"], ["Humidity", "Low"], ["Pet note", "Keep away from pets"]],
    tone: "lime" as const,
  },
  "bird-of-paradise": {
    name: "Bird of Paradise",
    category: "Indoor plants",
    price: 2499,
    level: "Medium care",
    size: "14\" pot",
    description: "Bold tropical foliage for a room that needs presence. Give it bright filtered light and space to stretch.",
    details: [["Light", "Bright, filtered light"], ["Water", "Water when top 3–4 cm dries"], ["Humidity", "Medium to high"], ["Pet note", "Keep away from pets"]],
    tone: "moss" as const,
  },
  "string-of-pearls": {
    name: "String of Pearls",
    category: "Succulents",
    price: 1199,
    level: "Medium care",
    size: "6\" hanging pot",
    description: "Trailing bead-like foliage that softens shelves and hanging spaces while staying beautifully sculptural.",
    details: [["Light", "Bright indirect light"], ["Water", "Allow soil to dry between waterings"], ["Humidity", "Low"], ["Pet note", "Keep away from pets"]],
    tone: "sage" as const,
  },
  lavender: {
    name: "Lavender",
    category: "Outdoor plants",
    price: 799,
    level: "Medium care",
    size: "8\" pot",
    description: "Fragrant flowering stems made for bright balconies, terraces and sunny garden corners.",
    details: [["Light", "Full sun to bright light"], ["Water", "Water when the soil surface dries"], ["Humidity", "Low"], ["Pet note", "Use ordinary pet-safe placement"]],
    tone: "lime" as const,
  },
  "fiddle-leaf-fig": {
    name: "Fiddle Leaf Fig",
    category: "Indoor plants",
    price: 2199,
    level: "Medium care",
    size: "12\" pot",
    description: "Large fiddle-shaped leaves and a polished silhouette for spaces that call for one confident green statement.",
    details: [["Light", "Bright indirect light"], ["Water", "Let the top layer dry before watering"], ["Humidity", "Medium"], ["Pet note", "Keep away from pets"]],
    tone: "moss" as const,
  },
  "aloe-vera": {
    name: "Aloe Vera",
    category: "Succulents",
    price: 699,
    level: "Easy care",
    size: "6\" pot",
    description: "A sunny, low-maintenance classic with fleshy leaves and a clean shape for desks, shelves and windowsills.",
    details: [["Light", "Bright light, some gentle sun"], ["Water", "Allow soil to dry fully"], ["Humidity", "Low"], ["Pet note", "Keep away from pets"]],
    tone: "sage" as const,
  },
};

export function generateStaticParams() {
  return Object.keys(catalog).map((slug) => ({ slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = catalog[slug as keyof typeof catalog];

  if (!product) notFound();

  return <ProductDetails product={product} />;
}
