import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/product-details";
import { getProductBySlug, getProducts } from "@/lib/products";

export async function generateStaticParams() {
  const products = await getProducts(true);
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) return {};

  const title = product.seo_title?.trim() || product.name;
  const description = product.seo_description?.trim() || product.short_description?.trim() || product.description;
  const canonicalSlug = product.canonical_slug?.trim() || product.slug;
  const image = product.image_url || product.image_urls?.[0] || undefined;

  return {
    title,
    description,
    alternates: { canonical: `/shop/${canonicalSlug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: image ? [{ url: image, alt: product.image_alt_text || product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) notFound();
  return <ProductDetails product={product} />;
}
