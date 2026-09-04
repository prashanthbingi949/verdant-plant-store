"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const BG_IMAGE_1 = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85";
const BG_IMAGE_2 = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85";
const SPOTLIGHT_R = 260;

function LogoMark() { return <svg width="26" height="26" viewBox="0 0 256 256" fill="none" aria-hidden="true"><path d="M256 256H128L0 128h128L256 256Z" fill="currentColor" /><path d="M256 128H128L0 0h128l128 128Z" fill="currentColor" opacity=".72" /></svg>; }
function MenuIcon({ open }: { open: boolean }) { return open ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>; }
function ArrowIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M13 7l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>; }

export default function VerdantSpotlightHero() {
  const heroRef = useRef<HTMLElement>(null); const revealRef = useRef<HTMLDivElement>(null); const mouse = useRef({ x: -999, y: -999 }); const smooth = useRef({ x: -999, y: -999 }); const rafRef = useRef<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false); const [scrolled, setScrolled] = useState(false); const [loggedIn, setLoggedIn] = useState(false); const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const hero = heroRef.current; const reveal = revealRef.current; if (!hero || !reveal) return;
    const setSpotlight = (x: number, y: number) => { const mask = `radial-gradient(circle ${SPOTLIGHT_R}px at ${x}px ${y}px, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,.75) 60%, rgba(255,255,255,.4) 75%, rgba(255,255,255,.12) 88%, rgba(255,255,255,0) 100%)`; reveal.style.setProperty("-webkit-mask-image", mask); reveal.style.setProperty("mask-image", mask); };
    const onMouseMove = (event: MouseEvent) => { mouse.current.x = event.clientX; mouse.current.y = event.clientY; };
    const tick = () => { smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1; smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1; if (smooth.current.x > -500 && smooth.current.y > -500) setSpotlight(smooth.current.x, smooth.current.y); rafRef.current = requestAnimationFrame(tick); };
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.72);
    const loadAuth = async () => { try { const response = await fetch("/api/auth/me", { cache: "no-store" }); const data = await response.json(); setLoggedIn(Boolean(data?.authenticated)); } catch {} };
    hero.addEventListener("mousemove", onMouseMove, { passive: true }); window.addEventListener("scroll", onScroll, { passive: true }); onScroll(); loadAuth(); rafRef.current = requestAnimationFrame(tick);
    return () => { hero.removeEventListener("mousemove", onMouseMove); window.removeEventListener("scroll", onScroll); if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, []);

  const handleLogout = async () => { setLoggingOut(true); try { await fetch("/api/auth/logout", { method: "POST" }); } finally { setLoggedIn(false); setLoggingOut(false); setMenuOpen(false); } };
  const navClass = scrolled ? "fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5 text-[#101510] transition-colors duration-300" : "fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5 text-white transition-colors duration-300";
  const navPillClass = scrolled ? "hidden md:flex absolute left-1/2 -translate-x-1/2 bg-[#f4f5e9]/95 backdrop-blur-md border border-black/10 rounded-full px-2 py-2 items-center gap-1 shadow-lg" : "hidden md:flex absolute left-1/2 -translate-x-1/2 bg-black/55 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1 shadow-2xl";
  const secondaryLinkClass = scrolled ? "!text-[#202d20] px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-black/5 transition-colors" : "!text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-white/20 transition-colors";
  const signUpClass = scrolled ? "hidden md:block !bg-[#202d20] !text-[#f4f5e9] text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#101510] transition-colors" : "hidden md:block !bg-white !text-[#101510] text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-colors";
  const accountClass = scrolled ? "rounded-full border-2 border-[#202d20] !bg-[#f4f5e9] px-4 py-2 text-sm font-bold !text-[#202d20] hover:!bg-[#202d20] hover:!text-[#f4f5e9] transition-colors" : "rounded-full border-2 border-white/50 !bg-black/55 px-4 py-2 text-sm font-bold !text-white backdrop-blur-md hover:!bg-white hover:!text-[#101510] transition-colors";
  const logoutClass = scrolled ? "rounded-full !bg-[#202d20] px-4 py-2 text-sm font-bold !text-[#f4f5e9] hover:!bg-[#101510]" : "rounded-full !bg-white px-4 py-2 text-sm font-bold !text-[#101510] hover:!bg-gray-100";
  const mobileButtonClass = scrolled ? "md:hidden w-10 h-10 grid place-items-center rounded-full bg-black/5 border border-black/10 text-[#202d20]" : "md:hidden w-10 h-10 grid place-items-center rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white";

  return <section ref={heroRef} className="verdant-spotlight relative w-full overflow-hidden bg-black h-screen" style={{ height: "100dvh", minHeight: "560px", fontFamily: "Inter, Arial, sans-serif" }}>
    <div className="absolute inset-0 z-10 bg-center bg-cover bg-no-repeat hero-zoom" style={{ backgroundImage: `url(${BG_IMAGE_1})` }} />
    <div className="absolute inset-0 z-[12] bg-gradient-to-b from-black/30 via-black/5 to-black/45 pointer-events-none" />
    <div ref={revealRef} className="absolute inset-0 z-30 bg-center bg-cover bg-no-repeat pointer-events-none" style={{ backgroundImage: `url(${BG_IMAGE_2})`, maskSize: "100% 100%", WebkitMaskSize: "100% 100%" }} />
    <nav className={navClass}>
      <Link href="/" className="flex items-center gap-2.5"><LogoMark /><span className="text-xl sm:text-2xl italic" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>Verdant</span></Link>
      <div className={navPillClass}>
        <Link href="/shop" className={scrolled ? "!bg-[#202d20] !text-[#f4f5e9] px-4 py-1.5 rounded-full text-sm font-semibold" : "!bg-white !text-[#101510] px-4 py-1.5 rounded-full text-sm font-semibold"}>Shop</Link>
        <a href="#collections" className={secondaryLinkClass}>Collections</a><a href="#care" className={secondaryLinkClass}>Plant Care</a><a href="#story" className={secondaryLinkClass}>Our Story</a><a href="#care" className={secondaryLinkClass}>Journal</a>
      </div>
      {loggedIn ? <div className="hidden md:flex items-center gap-2"><Link href="/account" className={accountClass}>Account</Link><button type="button" onClick={handleLogout} disabled={loggingOut} className={logoutClass}>{loggingOut ? "Logging out…" : "Log out"}</button></div> : <Link href="/signup" className={signUpClass}>Sign Up</Link>}
      <button type="button" onClick={() => setMenuOpen((open) => !open)} className={mobileButtonClass} aria-label={menuOpen ? "Close menu" : "Open menu"}><MenuIcon open={menuOpen} /></button>
    </nav>
    {menuOpen && <div className={scrolled ? "fixed top-[76px] left-4 right-4 z-[95] md:hidden rounded-3xl border border-black/10 bg-[#f4f5e9]/95 backdrop-blur-xl p-3 text-[#202d20] shadow-2xl" : "fixed top-[76px] left-4 right-4 z-[95] md:hidden rounded-3xl border border-white/20 bg-black/65 backdrop-blur-xl p-3 text-white shadow-2xl"}>
      <Link href="/shop" onClick={() => setMenuOpen(false)} className="block rounded-2xl px-4 py-3 text-base font-semibold">Shop</Link><a href="#collections" onClick={() => setMenuOpen(false)} className="block rounded-2xl px-4 py-3 text-base font-semibold">Collections</a><a href="#care" onClick={() => setMenuOpen(false)} className="block rounded-2xl px-4 py-3 text-base font-semibold">Plant Care</a><a href="#story" onClick={() => setMenuOpen(false)} className="block rounded-2xl px-4 py-3 text-base font-semibold">Our Story</a><a href="#care" onClick={() => setMenuOpen(false)} className="block rounded-2xl px-4 py-3 text-base font-semibold">Journal</a>
      {loggedIn ? <div className="mt-2 grid grid-cols-2 gap-2"><Link href="/account" onClick={() => setMenuOpen(false)} className="rounded-2xl border-2 border-current px-4 py-3 text-center text-base font-bold">Account</Link><button type="button" onClick={handleLogout} disabled={loggingOut} className="rounded-2xl bg-[#202d20] px-4 py-3 text-center text-base font-bold text-[#f4f5e9]">{loggingOut ? "Logging out…" : "Log out"}</button></div> : <Link href="/signup" onClick={() => setMenuOpen(false)} className="mt-2 block rounded-2xl bg-[#202d20] px-4 py-3 text-center text-base font-bold text-[#f4f5e9]">Sign Up</Link>}
    </div>}
    <div className="absolute top-[14%] left-0 right-0 z-50 flex flex-col items-center text-center px-5 pointer-events-none"><h1 className="text-white leading-[0.95] max-w-5xl"><span className="block italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal" style={{ animationDelay: "0.25s", letterSpacing: "-0.05em", fontFamily: "Georgia, 'Times New Roman', serif" }}>Grow something</span><span className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal" style={{ animationDelay: "0.42s", letterSpacing: "-0.08em" }}>worth keeping.</span></h1></div>
    <div className="hidden sm:block absolute bottom-14 left-10 md:left-14 z-50 max-w-[270px] hero-anim hero-fade" style={{ animationDelay: "0.7s" }}><p className="text-sm text-white/80 leading-relaxed">Bring a little life indoors. Thoughtfully selected plants, pots, and everyday rituals for spaces that feel calm, warm, and alive.</p></div>
    <div className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 z-50 max-w-full sm:max-w-[290px] flex flex-col items-start gap-4 sm:gap-5 hero-anim hero-fade" style={{ animationDelay: "0.85s" }}><p className="text-xs sm:text-sm text-white/80 leading-relaxed">Move your cursor across the garden to reveal another layer of the world — a small, tactile moment designed to make the store feel alive.</p><Link href="/shop" className="bg-[#ddf27a] hover:bg-[#c9e55f] text-[#101510] text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-lime-300/20 inline-flex items-center gap-2 pointer-events-auto">Explore plants <ArrowIcon /></Link></div>
  </section>;
}
