"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CircularText from "@/components/CircularText";

const visualStyles = `
  .verdant-site .verdant-footer-circular-host {
    position: absolute !important;
    z-index: 50 !important;
    width: 88px !important;
    height: 88px !important;
    display: block !important;
    overflow: visible !important;
    pointer-events: auto !important;
  }

  .verdant-site .verdant-footer-circular-host .circular-text {
    width: 88px !important;
    height: 88px !important;
    min-width: 88px !important;
    min-height: 88px !important;
    margin: 0 !important;
    display: block !important;
    color: var(--lime) !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  .verdant-site .verdant-footer-circular-host .circular-text span {
    color: var(--lime) !important;
    font-family: var(--font-geist-sans), Arial, Helvetica, sans-serif !important;
    font-size: 6.5px !important;
    line-height: 1 !important;
    font-weight: 850 !important;
    letter-spacing: .05em !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  @media (max-width: 640px) {
    .verdant-site .verdant-footer-circular-host,
    .verdant-site .verdant-footer-circular-host .circular-text {
      width: 70px !important;
      height: 70px !important;
      min-width: 70px !important;
      min-height: 70px !important;
    }

    .verdant-site .verdant-footer-circular-host .circular-text span {
      font-size: 5.2px !important;
    }
  }
`;

function findAboutHeading(root: HTMLElement): HTMLElement | null {
  const elements = Array.from(root.querySelectorAll<HTMLElement>("h1,h2,h3,h4,h5,h6,p,span,div"));
  return elements.find((element) => {
    if (element.children.length > 0) return false;
    return element.textContent?.trim().toUpperCase() === "ABOUT";
  }) ?? null;
}

function findFooter(): HTMLElement | null {
  return document.querySelector<HTMLElement>("footer, .site-footer, [class*='footer']");
}

export default function HomeVisualEffects() {
  const [mounted, setMounted] = useState(false);
  const [footerHost, setFooterHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    if (window.location.pathname !== "/") return;

    const attach = () => {
      const footer = findFooter();
      if (!footer) return false;

      const about = findAboutHeading(footer);
      if (!about) return false;

      const computed = window.getComputedStyle(footer);
      if (computed.position === "static") footer.style.position = "relative";
      footer.style.overflow = "visible";

      let host = footer.querySelector<HTMLDivElement>(".verdant-footer-circular-host");
      if (!host) {
        host = document.createElement("div");
        host.className = "verdant-footer-circular-host";
        footer.appendChild(host);
      }

      const positionHost = () => {
        const footerRect = footer.getBoundingClientRect();
        const aboutRect = about.getBoundingClientRect();
        const mobile = window.innerWidth <= 640;
        const size = mobile ? 70 : 88;
        const gap = mobile ? 12 : 16;

        host!.style.left = `${aboutRect.right - footerRect.left + gap}px`;
        host!.style.top = `${aboutRect.top - footerRect.top + (aboutRect.height - size) / 2}px`;
        host!.style.width = `${size}px`;
        host!.style.height = `${size}px`;
      };

      positionHost();
      window.addEventListener("resize", positionHost, { passive: true });
      setFooterHost(host);

      return () => {
        window.removeEventListener("resize", positionHost);
        if (host?.parentNode) host.parentNode.removeChild(host);
        setFooterHost(null);
      };
    };

    const cleanup = attach();
    if (cleanup) return cleanup;

    const observer = new MutationObserver(() => {
      const ready = attach();
      if (ready) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: visualStyles }} />
      {footerHost
        ? createPortal(
            <CircularText
              text="GREENS*PLANTS*GARDENING*"
              onHover="speedUp"
              spinDuration={20}
              className="verdant-footer-circular"
            />,
            footerHost,
          )
        : null}
    </>
  );
}
