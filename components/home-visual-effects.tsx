"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CircularText from "@/components/CircularText";

const visualStyles = `
  .verdant-site .footer-about-with-circular {
    position: relative !important;
    overflow: visible !important;
    min-height: 132px !important;
  }

  .verdant-site .footer-about-with-circular > .footer-circular-wrap {
    display: none !important;
  }

  .verdant-site .footer-circular-host {
    position: absolute !important;
    top: -10px !important;
    left: 150px !important;
    width: 112px !important;
    height: 112px !important;
    display: block !important;
    z-index: 30 !important;
    overflow: visible !important;
    pointer-events: auto !important;
  }

  .verdant-site .footer-circular-host .circular-text {
    position: relative !important;
    display: block !important;
    width: 112px !important;
    height: 112px !important;
    min-width: 112px !important;
    min-height: 112px !important;
    margin: 0 !important;
    overflow: visible !important;
    color: var(--lime) !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  .verdant-site .footer-circular-host .circular-text span {
    color: var(--lime) !important;
    font-family: var(--font-geist-sans), Arial, Helvetica, sans-serif !important;
    font-size: 8.5px !important;
    line-height: 1 !important;
    font-weight: 850 !important;
    letter-spacing: .055em !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  /* CurvedLoop removed: leave Plant Care flow clean and let the next section follow naturally. */
  .verdant-site .care-section {
    overflow: visible !important;
  }

  @media (max-width: 980px) {
    .verdant-site .footer-about-with-circular {
      min-height: 118px !important;
    }

    .verdant-site .footer-circular-host {
      left: 126px !important;
      top: -6px !important;
      width: 94px !important;
      height: 94px !important;
    }

    .verdant-site .footer-circular-host .circular-text {
      width: 94px !important;
      height: 94px !important;
      min-width: 94px !important;
      min-height: 94px !important;
    }

    .verdant-site .footer-circular-host .circular-text span {
      font-size: 7.2px !important;
    }
  }

  @media (max-width: 640px) {
    .verdant-site .footer-about-with-circular {
      min-height: 108px !important;
    }

    .verdant-site .footer-circular-host {
      left: 112px !important;
      top: -4px !important;
      width: 78px !important;
      height: 78px !important;
    }

    .verdant-site .footer-circular-host .circular-text {
      width: 78px !important;
      height: 78px !important;
      min-width: 78px !important;
      min-height: 78px !important;
    }

    .verdant-site .footer-circular-host .circular-text span {
      font-size: 5.5px !important;
    }
  }
`;

export default function HomeVisualEffects() {
  const [mounted, setMounted] = useState(false);
  const [footerHost, setFooterHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);

    if (window.location.pathname !== "/") return;

    const footerAbout = document.querySelector<HTMLElement>(".footer-about-with-circular");
    if (!footerAbout) return;

    let footerTarget = footerAbout.querySelector<HTMLDivElement>(".footer-circular-host");
    if (!footerTarget) {
      footerTarget = document.createElement("div");
      footerTarget.className = "footer-circular-host";
      footerAbout.appendChild(footerTarget);
    }
    setFooterHost(footerTarget);

    return () => {
      if (footerTarget?.parentNode) footerTarget.parentNode.removeChild(footerTarget);
      setFooterHost(null);
    };
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
