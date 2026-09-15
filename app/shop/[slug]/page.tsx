import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/product-details";
import ProductMasterStorefrontBridge from "@/components/product-master-storefront-bridge";
import { getProductBySlug } from "@/lib/products";

export const dynamic = "force-dynamic";

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
  if (!product || !product.active || product.publish_status === "archived" || product.publish_status === "draft") notFound();

  return (
    <>
      <ProductDetails product={product} />
      <ProductMasterStorefrontBridge product={product} />
    </>
  );
}
