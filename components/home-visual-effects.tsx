"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CurvedLoop from "@/components/CurvedLoop/CurvedLoop";
import CircularText from "@/components/CircularText";

const visualStyles = `
  /* CircularText: reserve real space beside ABOUT and keep it visible. */
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

  /* Plant Care: remove the large empty tail before the marquee. */
  .verdant-site .care-section {
    min-height: 0 !important;
    height: auto !important;
    padding-bottom: 0 !important;
    overflow: visible !important;
  }

  /* Full-bleed CurvedLoop with a restrained editorial wave. */
  .verdant-site .care-curved-loop-host {
    position: relative !important;
    z-index: 5 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 72px !important;
    min-height: 72px !important;
    margin-left: calc(50% - 50vw) !important;
    margin-right: 0 !important;
    margin-top: -6px !important;
    margin-bottom: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    display: block !important;
    flex-shrink: 0 !important;
    grid-column: 1 / -1 !important;
  }

  .verdant-site .care-curved-loop-host .curved-loop-jacket {
    width: 100% !important;
    height: 72px !important;
    min-height: 72px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    overflow: hidden !important;
    padding: 0 !important;
  }

  .verdant-site .care-curved-loop-host .curved-loop-svg {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 72px !important;
    min-height: 72px !important;
    aspect-ratio: auto !important;
    display: block !important;
    overflow: visible !important;
    fill: var(--forest) !important;
    font-size: 2.5rem !important;
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

    .verdant-site .care-curved-loop-host,
    .verdant-site .care-curved-loop-host .curved-loop-jacket,
    .verdant-site .care-curved-loop-host .curved-loop-svg {
      height: 60px !important;
      min-height: 60px !important;
    }

    .verdant-site .care-curved-loop-host .curved-loop-svg {
      font-size: 2.05rem !important;
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

    .verdant-site .care-curved-loop-host,
    .verdant-site .care-curved-loop-host .curved-loop-jacket,
    .verdant-site .care-curved-loop-host .curved-loop-svg {
      height: 52px !important;
      min-height: 52px !important;
    }

    .verdant-site .care-curved-loop-host .curved-loop-svg {
      font-size: 1.75rem !important;
    }
  }
`;

export default function HomeVisualEffects() {
  const [careHost, setCareHost] = useState<HTMLElement | null>(null);
  const [footerHost, setFooterHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (window.location.pathname !== "/") return;

    let observer: MutationObserver | null = null;
    let careTarget: HTMLDivElement | null = null;
    let footerTarget: HTMLDivElement | null = null;
    let cancelled = false;

    const attach = () => {
      if (cancelled) return true;

      const care = document.getElementById("care");
      const footerAbout = document.querySelector<HTMLElement>(".footer-about-with-circular");

      if (care) {
        careTarget = care.querySelector<HTMLDivElement>(".care-curved-loop-host");
        if (!careTarget) {
          careTarget = document.createElement("div");
          careTarget.className = "care-curved-loop-host";
          care.appendChild(careTarget);
        }
        setCareHost(careTarget);
      }

      if (footerAbout) {
        footerTarget = footerAbout.querySelector<HTMLDivElement>(".footer-circular-host");
        if (!footerTarget) {
          footerTarget = document.createElement("div");
          footerTarget.className = "footer-circular-host";
          footerAbout.appendChild(footerTarget);
        }
        setFooterHost(footerTarget);
      }

      return Boolean(care && footerAbout);
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
      if (careTarget?.parentNode) careTarget.parentNode.removeChild(careTarget);
      if (footerTarget?.parentNode) footerTarget.parentNode.removeChild(footerTarget);
      setCareHost(null);
      setFooterHost(null);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: visualStyles }} />
      {careHost
        ? createPortal(
            <CurvedLoop
              marqueeText="PLANT MORE JOY ✦ GROW SOMETHING GOOD ✦ BRING HOME A LITTLE WILD ✦ SHOP THE NEW ARRIVALS ✦"
              speed={1}
              curveAmount={28}
              direction="left"
              interactive={true}
              className="verdant-care-curved-loop"
            />,
            careHost,
          )
        : null}
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
