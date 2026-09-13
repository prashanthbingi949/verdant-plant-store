"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { FindMyPlant, ShopByMood } from "@/components/verdant-discovery";

export default function VerdantDiscoveryMount() {
  const pathname = usePathname();
  const [target, setTarget] = useState<HTMLDivElement | null>(null);

  const isProduct = pathname.startsWith("/shop/") && pathname.split("/").filter(Boolean).length === 2;
  const isShop = pathname === "/shop";
  const active = isProduct || isShop;

  useEffect(() => {
    if (!active) {
      setTarget(null);
      return;
    }
    const node = document.createElement("div");
    node.setAttribute("data-verdant-discovery-mount", "true");
    document.body.appendChild(node);
    setTarget(node);
    return () => {
      node.remove();
      setTarget(null);
    };
  }, [active]);

  if (!target) return null;
  return createPortal(isProduct ? <FindMyPlant /> : <ShopByMood />, target);
}
