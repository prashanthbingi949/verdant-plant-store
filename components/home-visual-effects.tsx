"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CurvedLoop from "@/components/CurvedLoop/CurvedLoop";

const footerAndCurvedStyles = `
  /* Keep the homepage ABOUT column and circular text together at every breakpoint. */
  .verdant-site .footer-about-with-circular {
    position: relative !important;
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) 104px !important;
    align-items: start !important;
    gap: 24px !important;
    min-width: 0 !important;
    overflow: visible !important;
  }

  .verdant-site .footer-about-with-circular > .footer-col {
    min-width: 0 !important;
    width: auto !important;
  }

  .verdant-site .footer-about-with-circular .footer-circular-wrap {
    width: 104px !important;
    height: 104px !important;
    min-width: 104px !important;
    display: grid !important;
    place-items: center !important;
    align-self: start !important;
    justify-self: end !important;
    margin: 0 !important;
    overflow: visible !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  .verdant-site .footer-about-with-circular .footer-circular-wrap .circular-text {
    display: block !important;
    position: relative !important;
    width: 104px !important;
    height: 104px !important;
    min-width: 104px !important;
    min-height: 104px !important;
    margin: 0 !important;
    color: var(--lime) !important;
    opacity: 1 !important;
    visibility: visible !important;
    overflow: visible !important;
  }

  .verdant-site .footer-about-with-circular .footer-circular-wrap .circular-text span {
    color: var(--lime) !important;
    font-family: var(--font-geist-sans), Arial, Helvetica, sans-serif !important;
    font-size: 9px !important;
    font-weight: 850 !important;
    letter-spacing: .05em !important;
  }

  .verdant-site .care-curved-loop-host {
    position: relative !important;
    z-index: 2 !important;
    width: calc(100% + (2 * clamp(24px, 7vw, 100px))) !important;
    margin-left: calc(-1 * clamp(24px, 7vw, 100px)) !important;
    margin-top: 14px !important;
    margin-bottom: 0 !important;
    height: 78px !important;
    overflow: hidden !important;
    display: block !important;
  }

  .verdant-site .care-curved-loop-host .curved-loop-jacket {
    min-height: 0 !important;
    height: 78px !important;
    display: flex !important;
    align-items: flex-end !important;
    justify-content: center !important;
    width: 100% !important;
  }

  .verdant-site .care-curved-loop-host .curved-loop-svg {
    width: 100% !important;
    height: 78px !important;
    aspect-ratio: auto !important;
    font-size: 4.5rem !important;
    fill: var(--forest) !important;
    overflow: visible !important;
  }

  .verdant-site .care-section {
    padding-bottom: 0 !important;
    overflow: visible !important;
  }

  @media (max-width: 980px) {
    .verdant-site .footer {
      grid-template-columns: 1fr 1fr !important;
    }

    .verdant-site .footer-brand {
      grid-column: 1 / -1 !important;
    }

    .verdant-site .footer-about-with-circular {
      grid-column: 1 / -1 !important;
      grid-template-columns: minmax(0, 1fr) 88px !important;
      gap: 22px !important;
    }

    .verdant-site .footer-about-with-circular .footer-circular-wrap,
    .verdant-site .footer-about-with-circular .footer-circular-wrap .circular-text {
      width: 88px !important;
      height: 88px !important;
      min-width: 88px !important;
      min-height: 88px !important;
    }

    .verdant-site .footer-about-with-circular .footer-circular-wrap .circular-text span {
      font-size: 7.5px !important;
    }
  }

  @media (max-width: 640px) {
    .verdant-site .footer {
      grid-template-columns: 1fr !important;
    }

    .verdant-site .footer-brand,
    .verdant-site .footer-col,
    .verdant-site .footer-about-with-circular {
      grid-column: auto !important;
    }

    .verdant-site .footer-about-with-circular {
      grid-template-columns: minmax(0, 1fr) 82px !important;
      gap: 16px !important;
      width: 100% !important;
    }

    .verdant-site .footer-about-with-circular .footer-circular-wrap,
    .verdant-site .footer-about-with-circular .footer-circular-wrap .circular-text {
      width: 82px !important;
      height: 82px !important;
      min-width: 82px !important;
      min-height: 82px !important;
    }

    .verdant-site .footer-about-with-circular .footer-circular-wrap .circular-text span {
      font-size: 6.5px !important;
    }

    .verdant-site .care-curved-loop-host,
    .verdant-site .care-curved-loop-host .curved-loop-jacket {
      height: 62px !important;
    }

    .verdant-site .care-curved-loop-host .curved-loop-svg {
      height: 62px !important;
      font-size: 3.25rem !important;
    }
  }
`;

export default function HomeVisualEffects() {
  const [careHost, setCareHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (window.location.pathname !== "/") return;

    let observer: MutationObserver | null = null;
    let host: HTMLDivElement | null = null;
    let cancelled = false;

    const attach = () => {
      if (cancelled) return true;
      const care = document.getElementById("care");
      if (!care) return false;

      host = care.querySelector<HTMLDivElement>(".care-curved-loop-host");
      if (!host) {
        host = document.createElement("div");
        host.className = "care-curved-loop-host";
        care.appendChild(host);
      }
      setCareHost(host);
      return true;
    };

    if (!attach()) {
      observer = new MutationObserver(() => {
        if (attach()) observer?.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (host?.parentNode) host.parentNode.removeChild(host);
      setCareHost(null);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: footerAndCurvedStyles }} />
      {careHost
        ? createPortal(
            <CurvedLoop
              marqueeText="PLANT MORE JOY ✦ GROW SOMETHING GOOD ✦ BRING HOME A LITTLE WILD ✦ SHOP THE NEW ARRIVALS ✦"
              speed={1}
              curveAmount={220}
              direction="left"
              interactive={true}
              className="verdant-care-curved-loop"
            />,
            careHost,
          )
        : null}
    </>
  );
}
