import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseSelect } from "@/lib/supabase-admin";

type Block = { type: "heading" | "paragraph"; text: string };
type CmsPage = { title: string; excerpt: string; content: Block[]; hero_image_url?: string | null };

export default async function CmsPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await supabaseSelect("cms_pages", `select=*&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`);
  const page = result.configured && result.response?.ok && Array.isArray(result.data) ? result.data[0] as CmsPage | undefined : undefined;
  if (!page) notFound();

  return <main className="min-h-screen bg-[#f4f5e9] text-[#101510]">
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f4f5e9]/90 px-5 py-4 backdrop-blur-xl sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link href="/" className="text-sm font-extrabold tracking-[.14em]">VERDANT</Link>
        <nav className="flex items-center gap-2 sm:gap-3"><Link href="/shop" className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold">Shop</Link><Link href="/" className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold">Home</Link></nav>
      </div>
    </header>
    <article className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="text-[10px] font-black tracking-[.2em] text-[#315233]">VERDANT JOURNAL</p>
      <h1 className="mt-4 text-5xl font-semibold tracking-[-.055em] sm:text-7xl">{page.title}</h1>
      {page.excerpt && <p className="mt-5 max-w-2xl text-base leading-7 text-black/55 sm:text-lg">{page.excerpt}</p>}
      {page.hero_image_url && <div className="mt-10 overflow-hidden rounded-[32px] bg-white/50"><img src={page.hero_image_url} alt="" className="max-h-[520px] w-full object-cover" /></div>}
      <div className="mt-12 space-y-8">
        {(page.content || []).map((block, index) => block.type === "heading"
          ? <h2 key={index} className="pt-4 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">{block.text}</h2>
          : <p key={index} className="max-w-3xl text-base leading-8 text-black/65 sm:text-lg">{block.text}</p>)}
      </div>
    </article>
  </main>;
}
