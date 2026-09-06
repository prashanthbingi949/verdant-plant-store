"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CurvedLoop from "@/components/CurvedLoop/CurvedLoop";
import CircularText from "@/components/CircularText";

const visualStyles = `
  .verdant-site .footer-about-with-circular {
    position: relative !important;
    overflow: visible !important;
  }

  /* The old inline placeholder is hidden; the real component is mounted in the dedicated host below. */
  .verdant-site .footer-about-with-circular > .footer-circular-wrap {
    display: none !important;
  }

  .verdant-site .footer-circular-host {
    position: absolute !important;
    top: -8px !important;
    right: 0 !important;
    width: 116px !important;
    height: 116px !important;
    min-width: 116px !important;
    min-height: 116px !important;
    display: grid !important;
    place-items: center !important;
    z-index: 20 !important;
    overflow: visible !important;
    pointer-events: auto !important;
  }

  .verdant-site .footer-circular-host .circular-text {
    position: relative !important;
    display: block !important;
    width: 116px !important;
    height: 116px !important;
    min-width: 116px !important;
    min-height: 116px !important;
    margin: 0 !important;
    overflow: visible !important;
    color: var(--lime) !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  .verdant-site .footer-circular-host .circular-text span {
    color: var(--lime) !important;
    font-family: var(--font-geist-sans), Arial, Helvetica, sans-serif !important;
    font-size: 9px !important;
    line-height: 1 !important;
    font-weight: 850 !important;
    letter-spacing: .055em !important;
  }

  /* Full-bleed CurvedLoop directly beneath Plant Care. */
  .verdant-site .care-curved-loop-host {
    position: relative !important;
    z-index: 5 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 92px !important;
    min-height: 92px !important;
    margin-left: calc(50% - 50vw) !important;
    margin-right: 0 !important;
    margin-top: 10px !important;
    margin-bottom: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    display: block !important;
    grid-column: 1 / -1 !important;
    flex-shrink: 0 !important;
  }

  .verdant-site .care-curved-loop-host .curved-loop-jacket {
    width: 100% !important;
    height: 92px !important;
    min-height: 92px !important;
    display: flex !important;
    align-items: flex-end !important;
    justify-content: center !important;
    overflow: visible !important;
    padding: 0 !important;
  }

  .verdant-site .care-curved-loop-host .curved-loop-svg {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 92px !important;
    min-height: 92px !important;
    aspect-ratio: auto !important;
    display: block !important;
    overflow: visible !important;
    fill: var(--forest) !important;
    font-size: 3.7rem !important;
  }

  .verdant-site .care-section {
    padding-bottom: 0 !important;
    overflow: visible !important;
  }

  @media (max-width: 980px) {
    .verdant-site .footer-circular-host {
      width: 96px !important;
      height: 96px !important;
      min-width: 96px !important;
      min-height: 96px !important;
      top: -4px !important;
    }

    .verdant-site .footer-circular-host .circular-text {
      width: 96px !important;
      height: 96px !important;
      min-width: 96px !important;
      min-height: 96px !important;
    }

    .verdant-site .footer-circular-host .circular-text span {
      font-size: 7.5px !important;
    }

    .verdant-site .care-curved-loop-host,
    .verdant-site .care-curved-loop-host .curved-loop-jacket,
    .verdant-site .care-curved-loop-host .curved-loop-svg {
      height: 78px !important;
      min-height: 78px !important;
    }

    .verdant-site .care-curved-loop-host .curved-loop-svg {
      font-size: 3rem !important;
    }
  }

  @media (max-width: 640px) {
    .verdant-site .footer-about-with-circular {
      min-height: 126px !important;
    }

    .verdant-site .footer-circular-host {
      width: 82px !important;
      height: 82px !important;
      min-width: 82px !important;
      min-height: 82px !important;
      top: -2px !important;
    }

    .verdant-site .footer-circular-host .circular-text {
      width: 82px !important;
      height: 82px !important;
      min-width: 82px !important;
      min-height: 82px !important;
    }

    .verdant-site .footer-circular-host .circular-text span {
      font-size: 6.1px !important;
    }

    .verdant-site .care-curved-loop-host,
    .verdant-site .care-curved-loop-host .curved-loop-jacket,
    .verdant-site .care-curved-loop-host .curved-loop-svg {
      height: 64px !important;
      min-height: 64px !important;
    }

    .verdant-site .care-curved-loop-host .curved-loop-svg {
      font-size: 2.55rem !important;
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
              curveAmount={140}
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
