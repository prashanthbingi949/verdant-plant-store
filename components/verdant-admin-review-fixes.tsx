"use client";

import { useEffect } from "react";

const SECTION_KEYS: Record<string, string> = {
  Hero: "hero",
  "Announcement strip": "marquee",
  Collections: "collections",
  "Featured products": "featured",
  "Our story": "story",
  "Plant care": "care",
  Newsletter: "newsletter",
  Footer: "footer",
};

function textFromAnnouncement(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;
    for (const key of ["text", "label", "title", "value"]) {
      if (typeof item[key] === "string") return item[key] as string;
    }
  }
  return "";
}

function normalizeAnnouncements(content: Record<string, unknown>) {
  const raw = Array.isArray(content.items) ? content.items : [];
  const items = raw.map(textFromAnnouncement).map((value) => value.replace(/\s+/g, " ").trim()).filter(Boolean);
  if (items.length) return [...new Set(items)];
  if (typeof content.text === "string") {
    const parsed = content.text.split("·").map((value) => value.replace(/\s+/g, " ").trim()).filter(Boolean);
    if (parsed.length) return [...new Set(parsed)];
  }
  return ["PLANT MORE JOY"];
}

function findSectionKey(article: HTMLElement) {
  const heading = article.querySelector("h2")?.textContent?.trim() || "";
  return SECTION_KEYS[heading] || "";
}

function findSaveButton(article: HTMLElement) {
  return Array.from(article.querySelectorAll<HTMLButtonElement>("button")).find((button) => {
    const text = button.textContent?.trim() || "";
    return text === "Save changes" || text === "Saving…" || text === "Saved";
  }) || null;
}

function setSaveButton(button: HTMLButtonElement, mode: "save" | "saving" | "saved") {
  button.textContent = mode === "saving" ? "Saving…" : mode === "saved" ? "Saved" : "Save changes";
  button.disabled = mode === "saved" || mode === "saving";
  button.dataset.reviewSaveState = mode;
}

export default function VerdantAdminReviewFixes() {
  useEffect(() => {
    let cancelled = false;
    const dirty = new Set<string>();
    const saved = new Set<string>();
    let restoreTimer: number | null = null;

    function markDirty(article: HTMLElement) {
      const key = findSectionKey(article);
      if (!key) return;
      dirty.add(key);
      saved.delete(key);
      const button = findSaveButton(article);
      if (button?.dataset.reviewSaveState !== "saving") setSaveButton(button, "save");
    }

    function markSaved(key: string) {
      const article = Array.from(document.querySelectorAll<HTMLElement>("main article")).find((node) => findSectionKey(node) === key);
      if (!article) return;
      const button = findSaveButton(article);
      if (!button) return;
      dirty.delete(key);
      saved.add(key);
      setSaveButton(button, "saved");
    }

    function bindAdminPage() {
      if (window.location.pathname !== "/admin/home") return () => {};

      const onInput = (event: Event) => {
        const target = event.target as HTMLElement | null;
        const article = target?.closest<HTMLElement>("article");
        if (article) markDirty(article);
      };
      const onClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        const article = target?.closest<HTMLElement>("article");
        if (!article) return;
        const button = target?.closest<HTMLButtonElement>("button");
        if (!button) return;
        const key = findSectionKey(article);
        if (!key) return;
        const label = button.textContent?.trim() || "";
        const aria = button.getAttribute("aria-label") || "";
        if (label === "Save changes" && !saved.has(key)) {
          setSaveButton(button, "saving");
        } else if (aria.startsWith("Enable section") || aria.startsWith("Disable section") || ["Remove", "+ Add announcement", "+ Add collection", "+ Add care item"].some((value) => label.startsWith(value))) {
          markDirty(article);
        }
      };

      document.addEventListener("input", onInput, true);
      document.addEventListener("change", onInput, true);
      document.addEventListener("click", onClick, true);

      const observer = new MutationObserver(() => {
        document.querySelectorAll<HTMLElement>("main article").forEach((article) => {
          const key = findSectionKey(article);
          if (!key) return;
          const button = findSaveButton(article);
          if (!button) return;
          if (saved.has(key)) setSaveButton(button, "saved");
          else if (dirty.has(key) && button.dataset.reviewSaveState !== "saving") setSaveButton(button, "save");
        });
      });
      observer.observe(document.body, { subtree: true, childList: true, characterData: true });

      const originalFetch = window.fetch.bind(window);
      const wrappedFetch: typeof window.fetch = async (input, init) => {
        const requestUrl = typeof input === "string" ? input : input instanceof Request ? input.url : input.toString();
        const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
        const isHomeSave = requestUrl.includes("/api/admin/home") && method === "PUT";
        let key = "";
        if (isHomeSave) {
          try {
            const raw = typeof init?.body === "string" ? init.body : "";
            key = raw ? String((JSON.parse(raw) as { section_key?: string }).section_key || "") : "";
          } catch {
            key = "";
          }
        }
        const response = await originalFetch(input, init);
        if (isHomeSave && key) {
          if (response.ok) {
            if (restoreTimer) window.clearTimeout(restoreTimer);
            window.setTimeout(() => {
              if (!cancelled) markSaved(key);
            }, 40);
          } else {
            window.setTimeout(() => {
              const article = Array.from(document.querySelectorAll<HTMLElement>("main article")).find((node) => findSectionKey(node) === key);
              const button = article ? findSaveButton(article) : null;
              if (button) {
                dirty.add(key);
                setSaveButton(button, "save");
              }
            }, 40);
          }
        }
        return response;
      };
      window.fetch = wrappedFetch;

      return () => {
        document.removeEventListener("input", onInput, true);
        document.removeEventListener("change", onInput, true);
        document.removeEventListener("click", onClick, true);
        observer.disconnect();
        window.fetch = originalFetch;
      };
    }

    function repairHomepageMarquee() {
      if (window.location.pathname !== "/") return () => {};
      let running = false;
      async function repair() {
        if (running) return;
        const flow = document.querySelector<HTMLElement>(".marquee-flow");
        if (!flow) return;
        const hasObjectText = flow.textContent?.includes("[object Object]");
        if (!hasObjectText) return;
        running = true;
        try {
          const response = await fetch("/api/cms/home", { cache: "no-store" });
          if (!response.ok) return;
          const data = await response.json().catch(() => null);
          const sections = Array.isArray(data?.sections) ? data.sections : [];
          const marquee = sections.find((section: any) => section?.section_key === "marquee");
          const items = normalizeAnnouncements((marquee?.content || {}) as Record<string, unknown>);
          const sequence = [...items, ...items, ...items, ...items, ...items, ...items];
          flow.replaceChildren(...sequence.map((item, index) => {
            const span = document.createElement("span");
            span.className = "marquee-item";
            span.textContent = item;
            const dot = document.createElement("b");
            dot.setAttribute("aria-hidden", "true");
            dot.textContent = "•";
            span.appendChild(dot);
            span.setAttribute("data-marquee-index", String(index));
            return span;
          }));
        } finally {
          running = false;
        }
      }
      const observer = new MutationObserver(() => void repair());
      observer.observe(document.body, { subtree: true, childList: true, characterData: true });
      void repair();
      return () => observer.disconnect();
    }

    const cleanAdmin = bindAdminPage();
    const cleanHome = repairHomepageMarquee();

    return () => {
      cancelled = true;
      cleanAdmin();
      cleanHome();
      if (restoreTimer) window.clearTimeout(restoreTimer);
    };
  }, []);

  return null;
}
