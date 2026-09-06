"use client";

/**
 * Homepage visual-effects hook kept as a lightweight compatibility component.
 * CircularText was removed from the footer because its dynamic positioning
 * was interfering with the desktop and mobile footer layout.
 */
export default function HomeVisualEffects() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          /* Remove all legacy CircularText footer geometry. */
          .verdant-site footer .footer-about-with-circular {
            position: static !important;
            display: block !important;
            min-width: 0 !important;
            min-height: 0 !important;
            width: auto !important;
            height: auto !important;
            overflow: visible !important;
          }

          .verdant-site footer .footer-about-with-circular > .footer-col {
            position: static !important;
            z-index: auto !important;
            min-width: 0 !important;
          }

          .verdant-site footer .footer-about-with-circular .footer-circular-wrap,
          .verdant-site footer .footer-about-with-circular .circular-text,
          .verdant-site footer .verdant-footer-circular-host,
          .verdant-site footer .verdant-footer-about-anchor,
          .verdant-site footer .verdant-footer-circular-host .circular-text {
            display: none !important;
            position: static !important;
            width: 0 !important;
            height: 0 !important;
            min-width: 0 !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
        `,
      }}
    />
  );
}
