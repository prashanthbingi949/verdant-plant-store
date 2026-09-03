import { notFound } from "next/navigation";
import ProductDetails from "@/components/product-details";
import { getProductBySlug } from "@/lib/products";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) notFound();

  return <ProductDetails product={product} />;
}
