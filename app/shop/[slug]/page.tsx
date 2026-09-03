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
    details: [
      ["Light", "Bright, indirect light"],
      ["Water", "When the top 2–3 cm of soil dries"],
      ["Humidity", "Medium to high"],
      ["Pet note", "Keep away from curious pets"],
    ],
    tone: "moss" as const,
  },
  "snake-plant": {
    name: "Snake Plant",
    category: "Indoor plants",
    price: 899,
    level: "Easy care",
    size: "10\" pot",
    description: "Architectural, resilient and comfortable in lower light. A dependable first plant with a clean silhouette that works almost anywhere.",
    details: [
      ["Light", "Low to bright indirect light"],
      ["Water", "Let soil dry between waterings"],
      ["Humidity", "Low to medium"],
      ["Pet note", "Keep away from pets"],
    ],
    tone: "sage" as const,
  },
  "jade-plant": {
    name: "Jade Plant",
    category: "Succulents",
    price: 649,
    level: "Easy care",
    size: "6\" pot",
    description: "A compact succulent with glossy leaves and a naturally sculptural form. Made for sunny desks, shelves and windowsills.",
    details: [
      ["Light", "Bright light with gentle sun"],
      ["Water", "Allow soil to dry fully"],
      ["Humidity", "Low"],
      ["Pet note", "Keep away from pets"],
    ],
    tone: "lime" as const,
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
