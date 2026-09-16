"use client";

import { useEffect } from "react";

function normalizeText(value: unknown): string {
  if (typeof value === "string") {
    const text = value.replace(/\s+/g, " ").trim();
    return text === "[object Object]" ? "" : text;
  }

  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;
    for (const key of ["text", "label", "title", "value", "name"]) {
      const text = normalizeText(item[key]);
      if (text) return text;
    }
  }

  return "";
}

function readItems(content: Record<string, unknown>): string[] {
  const rawItems = Array.isArray(content.items) ? content.items : [];
  const items = rawItems.map(normalizeText).filter(Boolean);
  if (items.length) return [...new Set(items)];

  if (typeof content.text === "string") {
    const parsed = content.text
      .split("·")
      .map(normalizeText)
      .filter(Boolean);
    if (parsed.length) return [...new Set(parsed)];
  }

  return ["PLANT MORE JOY"];
}

async function loadAnnouncementItems(): Promise<string[]> {
  try {
    const response = await fetch(`/api/cms/home?_announcement_fix=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return ["PLANT MORE JOY"];
    const data = await response.json().catch(() => null);
    const sections = Array.isArray(data?.sections) ? data.sections : [];
    const marquee = sections.find((section: any) => section?.section_key === "marquee");
    return readItems((marquee?.content || {}) as Record<string, unknown>);
  } catch {
    return ["PLANT MORE JOY"];
  }
}

function applyItems(flow: HTMLElement, items: string[]) {
  const sequence = [...items, ...items, ...items, ...items, ...items, ...items];
  const expectedText = sequence.map((item) => `${item}•`).join("");
  if (flow.textContent === expectedText) return;

  flow.replaceChildren(
    ...sequence.map((item, index) => {
      const span = document.createElement("span");
      span.className = "marquee-item";
      span.textContent = item;

      const dot = document.createElement("b");
      dot.setAttribute("aria-hidden", "true");
      dot.textContent = "•";
      span.appendChild(dot);
      span.setAttribute("data-marquee-index", String(index));
      return span;
    }),
  );
}

export default function AnnouncementStripFix() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;

    let disposed = false;
    let items = ["PLANT MORE JOY"];
    let loaded = false;

    const repair = async () => {
      if (disposed) return;
      const flow = document.querySelector<HTMLElement>(".marquee-flow");
      if (!flow) return;

      if (!loaded) {
        items = await loadAnnouncementItems();
        loaded = true;
      }

      if (!disposed) applyItems(flow, items);
    };

    const observer = new MutationObserver(() => {
      const flow = document.querySelector<HTMLElement>(".marquee-flow");
      if (flow) applyItems(flow, items);
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    void repair();

    const timer = window.setInterval(() => {
      const flow = document.querySelector<HTMLElement>(".marquee-flow");
      if (flow) applyItems(flow, items);
    }, 500);

    return () => {
      disposed = true;
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
