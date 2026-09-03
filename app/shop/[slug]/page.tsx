import { notFound } from "next/navigation";
import ProductDetails from "@/components/product-details";
import { getProductBySlug, getProducts } from "@/lib/products";

export async function generateStaticParams() {
  const products = await getProducts(true);
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) notFound();
  return <ProductDetails product={product} />;
}
