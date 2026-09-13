"use client";

import { useEffect } from "react";

const REVEAL_SELECTORS = [
  ".section",
  ".product-card",
  ".premium-category-card",
  ".care-list > a",
  ".story-section",
  ".verdant-favorite-card",
  ".vd-pdp .vd-story-card",
  ".vd-pdp .vd-related-card",
  ".vd-pdp .vd-fact",
  ".vd-pdp .vd-buy-box",
  ".shop-category-card",
  ".newsletter",
  ".footer-brand",
  ".footer-col",
];

function isReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function markRevealables() {
  if (isReducedMotion()) return [] as HTMLElement[];
  const nodes = REVEAL_SELECTORS.flatMap((selector) => Array.from(document.querySelectorAll<HTMLElement>(selector)));
  const unique = Array.from(new Set(nodes));
  unique.forEach((node, index) => {
    node.classList.add("vd-premium-reveal");
    if (!node.dataset.vdRevealDelay) {
      node.dataset.vdRevealDelay = String(Math.min(index % 6, 5));
    }
  });
  return unique;
}

export default function VerdantPremiumMotion() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("verdant-premium-ready");

    const revealables = markRevealables();
    const observer = !isReducedMotion()
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer?.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.06, rootMargin: "0px 0px -6% 0px" },
        )
      : null;

    revealables.forEach((node) => observer?.observe(node));

    const syncPageState = () => {
      const scrollY = window.scrollY;
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, scrollY / scrollable));
      root.style.setProperty("--vd-scroll-progress", String(progress));
      root.dataset.scrollY = String(scrollY);
      root.classList.toggle("verdant-page-scrolled", scrollY > 18);
    };

    syncPageState();
    window.addEventListener("scroll", syncPageState, { passive: true });
    window.addEventListener("resize", syncPageState, { passive: true });

    const mutationObserver = new MutationObserver(() => {
      const added = markRevealables();
      added.forEach((node) => observer?.observe(node));
      syncPageState();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", syncPageState);
      window.removeEventListener("resize", syncPageState);
      observer?.disconnect();
      mutationObserver.disconnect();
      root.classList.remove("verdant-premium-ready", "verdant-page-scrolled");
      root.style.removeProperty("--vd-scroll-progress");
      delete root.dataset.scrollY;
    };
  }, []);

  return null;
}
