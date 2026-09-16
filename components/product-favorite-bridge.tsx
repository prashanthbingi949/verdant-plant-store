"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { FAV_EVENT, readFavoriteSlugs, toggleFavoriteSlug } from "@/components/favorites-bridge";

function currentSlug(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return parts[0] === "shop" && parts[1] ? parts[1].split(/[?#]/)[0] : "";
}

function applySavedState(button: HTMLButtonElement, liked: boolean) {
  button.classList.toggle("is-saved", liked);
  button.setAttribute("aria-pressed", String(liked));
  button.setAttribute("aria-label", liked ? "Remove from favourites" : "Save to favourites");
  button.setAttribute("title", liked ? "Remove from favourites" : "Save to favourites");
  button.style.color = liked ? "#202d20" : "rgba(16,21,16,.42)";

  const textNode = Array.from(button.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
  if (textNode) textNode.nodeValue = liked ? "Saved " : "Save ";

  const icon = button.querySelector<SVGElement>("svg");
  if (icon) icon.style.fill = liked ? "currentColor" : "none";
}

export default function ProductFavoriteBridge() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith("/shop/") || pathname === "/shop/") return;
    let disposed = false;

    const sync = () => {
      const slug = currentSlug(pathname);
      const liked = slug ? readFavoriteSlugs().includes(slug) : false;
      document.querySelectorAll<HTMLButtonElement>("button.vd-save").forEach((button) => applySavedState(button, liked));
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const button = target?.closest<HTMLButtonElement>("button.vd-save");
      if (!button) return;
      const slug = currentSlug(pathname);
      if (!slug) return;
      const liked = toggleFavoriteSlug(slug);
      applySavedState(button, liked);
      // Let the PDP's own React handler also run so its local state stays correct.
    };

    const observer = new MutationObserver(() => {
      if (!disposed) sync();
    });

    document.addEventListener("click", onClick, true);
    window.addEventListener("storage", sync);
    window.addEventListener(FAV_EVENT, sync);
    observer.observe(document.body, { subtree: true, childList: true });
    sync();

    return () => {
      disposed = true;
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("storage", sync);
      window.removeEventListener(FAV_EVENT, sync);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
