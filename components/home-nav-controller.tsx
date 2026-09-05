"use client";

import { useEffect } from "react";

const TARGETS: Record<string, string> = {
  "/shop": "#shop",
  "/#collections": "#collections",
  "/#care": "#care",
  "/#story": "#story",
  "/pages/plant-care": ".footer",
};

function scrollToTarget(selector: string) {
  const target = selector.startsWith(".")
    ? document.querySelector<HTMLElement>(selector)
    : document.getElementById(selector.slice(1));

  if (!target) return;

  const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 18);
  window.scrollTo({ top, behavior: "smooth" });
}

export default function HomeNavController() {
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".verdant-spotlight nav");
    if (!nav) return;

    const accountLink = nav.querySelector<HTMLAnchorElement>('a[href="/account"], a[href="/signup"]');
    const actionGroup = accountLink?.parentElement as HTMLElement | null;
    if (actionGroup) actionGroup.style.display = "none";

    const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>("a")).filter((link) => {
      const href = link.getAttribute("href") || "";
      return href in TARGETS;
    });

    const handlers = new Map<HTMLAnchorElement, (event: MouseEvent) => void>();

    for (const link of links) {
      const handler = (event: MouseEvent) => {
        const href = link.getAttribute("href") || "";
        const target = TARGETS[href];
        if (!target) return;

        const samePage = window.location.pathname === "/";
        if (!samePage && href !== "/shop") return;

        const targetElement = target.startsWith(".")
          ? document.querySelector<HTMLElement>(target)
          : document.getElementById(target.slice(1));
        if (!targetElement) return;

        event.preventDefault();
        event.stopPropagation();
        scrollToTarget(target);
      };

      link.addEventListener("click", handler);
      handlers.set(link, handler);
    }

    return () => {
      for (const [link, handler] of handlers) link.removeEventListener("click", handler);
      if (actionGroup) actionGroup.style.display = "";
    };
  }, []);

  return null;
}
