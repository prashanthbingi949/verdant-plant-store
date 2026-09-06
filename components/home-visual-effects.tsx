"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CircularText from "@/components/CircularText";

const visualStyles = `
  .verdant-site .verdant-footer-circular-host {
    position: absolute !important;
    z-index: 50 !important;
    width: 108px !important;
    height: 108px !important;
    min-width: 108px !important;
    min-height: 108px !important;
    display: block !important;
    overflow: visible !important;
    pointer-events: auto !important;
  }

  .verdant-site .verdant-footer-circular-host .circular-text {
    position: relative !important;
    display: block !important;
    width: 108px !important;
    height: 108px !important;
    min-width: 108px !important;
    min-height: 108px !important;
    margin: 0 !important;
    overflow: visible !important;
    color: var(--lime) !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  .verdant-site .verdant-footer-circular-host .circular-text span {
    color: var(--lime) !important;
    font-family: var(--font-geist-sans), Arial, Helvetica, sans-serif !important;
    font-size: 10.5px !important;
    line-height: 1 !important;
    font-weight: 850 !important;
    letter-spacing: .055em !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  @media (max-width: 900px) {
    .verdant-site .verdant-footer-circular-host,
    .verdant-site .verdant-footer-circular-host .circular-text {
      width: 92px !important;
      height: 92px !important;
      min-width: 92px !important;
      min-height: 92px !important;
    }

    .verdant-site .verdant-footer-circular-host .circular-text span {
      font-size: 8.5px !important;
    }
  }

  @media (max-width: 640px) {
    .verdant-site .verdant-footer-circular-host,
    .verdant-site .verdant-footer-circular-host .circular-text {
      width: 78px !important;
      height: 78px !important;
      min-width: 78px !important;
      min-height: 78px !important;
    }

    .verdant-site .verdant-footer-circular-host .circular-text span {
      font-size: 6.8px !important;
    }
  }
`;

function findFooter(): HTMLElement | null {
  return document.querySelector<HTMLElement>("footer")
    ?? document.querySelector<HTMLElement>(".site-footer")
    ?? document.querySelector<HTMLElement>("[class*='footer']");
}

function findLinkByText(root: HTMLElement, text: string): HTMLAnchorElement | null {
  return Array.from(root.querySelectorAll<HTMLAnchorElement>("a")).find(
    (link) => link.textContent?.trim().toLowerCase() === text.toLowerCase(),
  ) ?? null;
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

      const careJournal = findLinkByText(footer, "Care journal");
      const account = findLinkByText(footer, "Account");
      if (!careJournal || !account) return false;

      const anchor = careJournal.parentElement ?? account.parentElement;
      if (!anchor) return false;

      anchor.classList.add("verdant-footer-about-anchor");
      anchor.style.position = "relative";
      anchor.style.overflow = "visible";

      let host = anchor.querySelector<HTMLDivElement>(".verdant-footer-circular-host");
      if (!host) {
        host = document.createElement("div");
        host.className = "verdant-footer-circular-host";
        anchor.appendChild(host);
      }

      const position = () => {
        if (!host) return;
        const mobile = window.innerWidth <= 640;
        const tablet = window.innerWidth <= 900;
        const size = mobile ? 78 : tablet ? 92 : 108;
        const gap = mobile ? 16 : 24;
        const careRect = careJournal.getBoundingClientRect();
        const accountRect = account.getBoundingClientRect();
        const anchorRect = anchor.getBoundingClientRect();
        const pairCenter = (careRect.top + accountRect.bottom) / 2;

        host.style.width = `${size}px`;
        host.style.height = `${size}px`;
        host.style.left = `${anchorRect.width + gap}px`;
        host.style.top = `${pairCenter - anchorRect.top - size / 2}px`;
      };

      position();
      window.addEventListener("resize", position, { passive: true });
      setFooterHost(host);

      return () => {
        window.removeEventListener("resize", position);
        if (host?.parentNode) host.parentNode.removeChild(host);
        setFooterHost(null);
      };
    };

    if (attach()) return;

    const observer = new MutationObserver(() => {
      if (attach()) observer.disconnect();
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
