"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { FindMyPlant, ShopByMood } from "@/components/verdant-discovery";

export default function VerdantDiscoveryMount() {
  const pathname = usePathname();
  const [target, setTarget] = useState<HTMLElement | null>(null);

  const isProduct = pathname.startsWith("/shop/") && pathname.split("/").filter(Boolean).length === 2;
  const isShop = pathname === "/shop";
  const active = isProduct || isShop;

  useEffect(() => {
    if (!active) {
      setTarget(null);
      return;
    }

    let attempts = 0;
    let cancelled = false;

    const attach = () => {
      if (cancelled) return;

      const pageRoot = isProduct
        ? document.querySelector("main.vd-pdp")
        : document.querySelector("main.verdant-shop-page");

      if (!pageRoot) {
        attempts += 1;
        if (attempts < 30) window.setTimeout(attach, 50);
        return;
      }

      const node = document.createElement("div");
      node.setAttribute("data-verdant-discovery-mount", "true");
      pageRoot.appendChild(node);
      setTarget(node);
    };

    attach();

    return () => {
      cancelled = true;
      setTarget(null);
      const node = document.querySelector('[data-verdant-discovery-mount="true"]');
      node?.remove();
    };
  }, [active, isProduct]);

  if (!target) return null;
  return createPortal(isProduct ? <FindMyPlant /> : <ShopByMood />, target);
}
