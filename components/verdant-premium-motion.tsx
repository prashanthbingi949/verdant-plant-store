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
];

function isReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function VerdantPremiumMotion() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("verdant-premium-ready");

    const markRevealables = () => {
      if (isReducedMotion()) return [] as HTMLElement[];
      const nodes = REVEAL_SELECTORS.flatMap((selector) => Array.from(document.querySelectorAll<HTMLElement>(selector)));
      const unique = Array.from(new Set(nodes));
      unique.forEach((node) => node.classList.add("vd-premium-reveal"));
      return unique;
    };

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
          { threshold: 0.08, rootMargin: "0px 0px -7% 0px" },
        )
      : null;

    revealables.forEach((node) => observer?.observe(node));

    const syncPageState = () => {
      root.dataset.scrollY = String(window.scrollY);
      root.classList.toggle("verdant-page-scrolled", window.scrollY > 18);
    };

    syncPageState();
    window.addEventListener("scroll", syncPageState, { passive: true });

    const mutationObserver = new MutationObserver(() => {
      const added = markRevealables();
      added.forEach((node) => observer?.observe(node));
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", syncPageState);
      observer?.disconnect();
      mutationObserver.disconnect();
      root.classList.remove("verdant-premium-ready", "verdant-page-scrolled");
      delete root.dataset.scrollY;
    };
  }, []);

  return null;
}
