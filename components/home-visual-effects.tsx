"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CircularText from "@/components/CircularText";

const visualStyles = `
  /* CircularText is anchored directly to the ABOUT column so it cannot be
     misplaced by the footer grid or viewport coordinates. */
  .verdant-site .verdant-footer-about-anchor {
    position: relative !important;
    overflow: visible !important;
  }

  .verdant-site .verdant-footer-circular-host {
    position: absolute !important;
    z-index: 20 !important;
    top: -16px !important;
    left: 112px !important;
    width: 96px !important;
    height: 96px !important;
    min-width: 96px !important;
    min-height: 96px !important;
    display: block !important;
    overflow: visible !important;
    pointer-events: auto !important;
  }

  .verdant-site .verdant-footer-circular-host .circular-text {
    position: relative !important;
    display: block !important;
    width: 96px !important;
    height: 96px !important;
    min-width: 96px !important;
    min-height: 96px !important;
    margin: 0 !important;
    overflow: visible !important;
    color: var(--lime) !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  .verdant-site .verdant-footer-circular-host .circular-text span {
    color: var(--lime) !important;
    font-family: var(--font-geist-sans), Arial, Helvetica, sans-serif !important;
    font-size: 7px !important;
    line-height: 1 !important;
    font-weight: 850 !important;
    letter-spacing: .055em !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  @media (max-width: 900px) {
    .verdant-site .verdant-footer-circular-host {
      top: -10px !important;
      left: 104px !important;
      width: 82px !important;
      height: 82px !important;
      min-width: 82px !important;
      min-height: 82px !important;
    }

    .verdant-site .verdant-footer-circular-host .circular-text {
      width: 82px !important;
      height: 82px !important;
      min-width: 82px !important;
      min-height: 82px !important;
    }

    .verdant-site .verdant-footer-circular-host .circular-text span {
      font-size: 5.8px !important;
    }
  }

  @media (max-width: 640px) {
    .verdant-site .verdant-footer-circular-host {
      top: -6px !important;
      left: 94px !important;
      width: 72px !important;
      height: 72px !important;
      min-width: 72px !important;
      min-height: 72px !important;
    }

    .verdant-site .verdant-footer-circular-host .circular-text {
      width: 72px !important;
      height: 72px !important;
      min-width: 72px !important;
      min-height: 72px !important;
    }

    .verdant-site .verdant-footer-circular-host .circular-text span {
      font-size: 5px !important;
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
  return document.querySelector<HTMLElement>("footer")
    ?? document.querySelector<HTMLElement>(".site-footer")
    ?? document.querySelector<HTMLElement>("[class*='footer']");
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
      if (!about || !about.parentElement) return false;

      const anchor = about.parentElement;
      anchor.classList.add("verdant-footer-about-anchor");
      anchor.style.overflow = "visible";

      let host = anchor.querySelector<HTMLDivElement>(".verdant-footer-circular-host");
      if (!host) {
        host = document.createElement("div");
        host.className = "verdant-footer-circular-host";
        anchor.appendChild(host);
      }

      setFooterHost(host);
      return true;
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
