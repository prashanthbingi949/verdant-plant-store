"use client";

import { useEffect } from "react";

const TARGETS: Record<string, string> = {
  "/shop": "#shop",
  "/#collections": "#collections",
  "/#care": "#care",
  "/#story": "#story",
  "/pages/plant-care": "#care",
};

function getTarget(href: string): HTMLElement | null {
  const selector = TARGETS[href];
  if (!selector) return null;
  return document.querySelector<HTMLElement>(selector);
}

export default function HomeNavController() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest<HTMLAnchorElement>(".verdant-spotlight nav a");
      if (!link) return;

      const href = link.getAttribute("href") || "";
      const destination = getTarget(href);
      if (!destination) return;

      event.preventDefault();

      const nav = document.querySelector<HTMLElement>(".verdant-spotlight nav");
      const navHeight = nav?.getBoundingClientRect().height ?? 0;
      const destinationTop = Math.max(
        0,
        destination.getBoundingClientRect().top + window.scrollY - navHeight - 12,
      );

      window.history.replaceState(null, "", href === "/#collections" ? "#collections" : href === "/#care" ? "#care" : href === "/#story" ? "#story" : href === "/shop" ? "#shop" : "#care");

      window.scrollTo({
        top: destinationTop,
        behavior: "smooth",
      });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
