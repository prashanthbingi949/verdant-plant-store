"use client";

/*
 * Decorative homepage visual effects are intentionally disabled here.
 * CircularText was removed because its footer positioning was affecting
 * the desktop and mobile footer layout. Keeping this component as a
 * lightweight no-op preserves the existing layout import without adding
 * any DOM manipulation, portals, measurements, or animations.
 */
export default function HomeVisualEffects() {
  return null;
}
