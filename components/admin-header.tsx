import Link from "next/link";

const links = [
  ["Home", "/admin/home"],
  ["Site", "/admin/site"],
  ["Pages", "/admin/pages"],
  ["Media", "/admin/media"],
  ["Catalog", "/admin/catalog"],
  ["Products", "/admin/products"],
  ["Orders", "/admin/orders"],
] as const;

export default function AdminHeader({ section }: { section: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f4f5e9]/95 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <div className="min-w-[105px] shrink-0">
          <Link href="/admin" className="text-xs font-extrabold tracking-[.2em]">VERDANT</Link>
          <p className="mt-1 text-[9px] font-bold tracking-[.16em] text-black/40">ADMIN / {section}</p>
        </div>
        <nav aria-label="Admin navigation" className="min-w-0 flex-1 overflow-x-auto">
          <div className="flex min-w-max items-center justify-end gap-1.5 sm:gap-2">
            {links.map(([label, href]) => (
              <Link key={href} href={href} className="shrink-0 rounded-full border border-black/10 bg-white/20 px-3 py-2 text-xs font-semibold transition hover:bg-white/70 sm:px-4 sm:text-sm">{label}</Link>
            ))}
            <Link href="/" className="shrink-0 rounded-full border border-black/10 bg-white/20 px-3 py-2 text-xs font-semibold transition hover:bg-white/70 sm:px-4 sm:text-sm">View store</Link>
            <form action="/api/admin/logout" method="post" className="shrink-0">
              <button type="submit" className="rounded-full bg-[#202d20] px-3 py-2 text-xs font-bold text-[#f4f5e9] sm:px-4 sm:text-sm">Log out</button>
            </form>
          </div>
        </nav>
      </div>
    </header>
  );
}
