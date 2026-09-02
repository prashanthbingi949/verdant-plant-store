"use client";

import { useEffect, useRef, useState } from "react";

const BG_IMAGE_1 =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85";

const BG_IMAGE_2 =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85";

const SPOTLIGHT_R = 260;

function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 256 256" fill="none" aria-hidden="true">
      <path d="M256 256H128L0 128h128L256 256Z" fill="currentColor" />
      <path d="M256 128H128L0 0h128l128 128Z" fill="currentColor" opacity=".72" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h13M13 7l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RevealLayer({ image, cursorX, cursorY }: { image: string; cursorX: number; cursorY: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [mask, setMask] = useState("");

  useEffect(() => {
    const resize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || cursorX < -100 || cursorY < -100) return;

    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = context.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, SPOTLIGHT_R);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.4, "rgba(255,255,255,1)");
    gradient.addColorStop(0.6, "rgba(255,255,255,.75)");
    gradient.addColorStop(0.75, "rgba(255,255,255,.4)");
    gradient.addColorStop(0.88, "rgba(255,255,255,.12)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
    context.fill();

    const dataUrl = canvas.toDataURL("image/png");
    setMask(`url(${dataUrl})`);
  }, [cursorX, cursorY, size]);

  return (
    <>
      <canvas ref={canvasRef} width={size.width} height={size.height} className="absolute inset-0 pointer-events-none hidden" />
      <div
        className="absolute inset-0 z-30 pointer-events-none bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(${image})`,
          maskImage: mask,
          WebkitMaskImage: mask,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
        }}
      />
    </>
  );
}

export default function VerdantSpotlightHero() {
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      mouse.current.x = event.clientX;
      mouse.current.y = event.clientY;
    };

    const tick = () => {
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1;
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1;
      setCursorPos({ x: smooth.current.x, y: smooth.current.y });
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMouseMove);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section className="verdant-spotlight relative w-full overflow-hidden h-screen bg-black" style={{ height: "100dvh" }}>
      <div className="absolute inset-0 z-10 bg-center bg-cover bg-no-repeat hero-zoom" style={{ backgroundImage: `url(${BG_IMAGE_1})` }} />
      <div className="absolute inset-0 z-[12] bg-gradient-to-b from-black/30 via-black/5 to-black/45 pointer-events-none" />
      <RevealLayer image={BG_IMAGE_2} cursorX={cursorPos.x} cursorY={cursorPos.y} />

      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5 text-white">
        <a href="#top" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-xl sm:text-2xl font-playfair italic">Verdant</span>
        </a>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-2 py-2 items-center gap-1 shadow-2xl">
          <a href="#shop" className="bg-white text-gray-900 px-4 py-1.5 rounded-full text-sm font-medium">Shop</a>
          <a href="#collections" className="text-white/80 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white/20 hover:text-white transition-colors">Collections</a>
          <a href="#care" className="text-white/80 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white/20 hover:text-white transition-colors">Plant Care</a>
          <a href="#story" className="text-white/80 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white/20 hover:text-white transition-colors">Our Story</a>
          <a href="#account" className="text-white/80 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white/20 hover:text-white transition-colors">Journal</a>
        </div>

        <a href="#account" className="hidden md:block bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-colors">Sign Up</a>
        <button onClick={() => setMenuOpen((open) => !open)} className="md:hidden w-10 h-10 grid place-items-center rounded-full bg-white/15 backdrop-blur-md border border-white/20" aria-label={menuOpen ? "Close menu" : "Open menu"}>
          <MenuIcon open={menuOpen} />
        </button>
      </nav>

      {menuOpen && (
        <div className="fixed top-[76px] left-4 right-4 z-[95] md:hidden rounded-3xl border border-white/20 bg-black/65 backdrop-blur-xl p-3 text-white shadow-2xl">
          {[
            ["Shop", "#shop"],
            ["Collections", "#collections"],
            ["Plant Care", "#care"],
            ["Our Story", "#story"],
            ["Journal", "#account"],
          ].map(([label, href]) => (
            <a key={label} href={href} onClick={() => setMenuOpen(false)} className="block rounded-2xl px-4 py-3 text-base text-white/90 hover:bg-white/10">
              {label}
            </a>
          ))}
        </div>
      )}

      <div className="absolute top-[15%] left-0 right-0 z-50 flex flex-col items-center text-center px-5 pointer-events-none hero-copy-safe">
        <h1 className="text-white leading-[0.95] max-w-5xl">
          <span className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal" style={{ animationDelay: "0.25s", letterSpacing: "-0.05em" }}>Grow something</span>
          <span className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal" style={{ animationDelay: "0.42s", letterSpacing: "-0.08em" }}>worth keeping.</span>
        </h1>
      </div>

      <div className="hidden sm:block absolute bottom-14 left-10 md:left-14 z-50 max-w-[270px] hero-anim hero-fade" style={{ animationDelay: "0.7s" }}>
        <p className="text-sm text-white/80 leading-relaxed">Bring a little life indoors. Thoughtfully selected plants, pots, and everyday rituals for spaces that feel calm, warm, and alive.</p>
      </div>

      <div className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 z-50 max-w-full sm:max-w-[290px] flex flex-col items-start gap-4 sm:gap-5 hero-anim hero-fade" style={{ animationDelay: "0.85s" }}>
        <p className="text-xs sm:text-sm text-white/80 leading-relaxed">Move your cursor across the garden to reveal another layer of the world — a small, tactile moment designed to make the store feel alive.</p>
        <a href="#shop" className="bg-[#ddf27a] hover:bg-[#c9e55f] text-[#101510] text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-lime-300/20 inline-flex items-center gap-2">
          Explore plants <ArrowIcon />
        </a>
      </div>
    </section>
  );
}
