"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const POPULAR = [
  "Monstera",
  "Indoor plants",
  "Ceramic pots",
  "Soil",
  "Fertilizers",
  "Garden tools",
];

const SEARCH_HINTS = [
  "Monstera Deliciosa",
  "Snake Plant",
  "Jade Plant",
  "Indoor plants",
  "Outdoor plants",
  "Pots & planters",
  "Soil & growing media",
  "Fertilizers & nutrients",
  "Tools & equipment",
];

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

export default function ShopSearchEnhancer() {
  const activeCleanup = useRef<(() => void) | null>(null);
  const activeInput = useRef<HTMLInputElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let disposed = false;
    let setupTimer: number | null = null;

    const teardown = () => {
      activeCleanup.current?.();
      activeCleanup.current = null;
      activeInput.current = null;
    };

    const setup = () => {
      if (disposed) return;
      const input = document.querySelector<HTMLInputElement>(".verdant-shop-page .shop-search");
      if (!input) {
        teardown();
        return;
      }
      if (activeInput.current === input) return;

      teardown();
      activeInput.current = input;

      const panel = document.createElement("div");
      panel.className = "verdant-search-panel";
      panel.setAttribute("role", "listbox");
      panel.setAttribute("aria-label", "Shop search suggestions");
      panel.hidden = true;
      document.body.appendChild(panel);

      let closeTimer: number | null = null;

      const updatePosition = () => {
        const rect = input.getBoundingClientRect();
        const viewportPadding = 16;
        const width = Math.min(rect.width, Math.max(240, window.innerWidth - viewportPadding * 2));
        const left = Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - width - viewportPadding));
        panel.style.width = `${width}px`;
        panel.style.left = `${left}px`;
        panel.style.top = `${rect.bottom + 10}px`;
      };

      const render = () => {
        const query = input.value.trim().toLowerCase();
        const values = (query ? SEARCH_HINTS.filter((item) => item.toLowerCase().includes(query)) : POPULAR).slice(0, 6);
        panel.innerHTML = `
          <div class="verdant-search-panel-head"><span>${query ? "Suggestions" : "Popular searches"}</span><kbd>ESC</kbd></div>
          <div class="verdant-search-suggestions">
            ${values.length ? values.map((value) => `<button type="button" class="verdant-search-suggestion" data-value="${value.replaceAll('"', '&quot;')}"><span class="verdant-search-suggestion-icon">⌕</span><span>${value}</span></button>`).join("") : '<div class="verdant-search-empty">No close matches yet — try another plant or garden essential.</div>'}
          </div>`;
      };

      const open = () => {
        if (closeTimer !== null) {
          window.clearTimeout(closeTimer);
          closeTimer = null;
        }
        panel.hidden = false;
        panel.classList.add("is-open");
        input.classList.add("is-search-focused");
        updatePosition();
        render();
      };

      const close = () => {
        panel.classList.remove("is-open");
        input.classList.remove("is-search-focused");
        if (closeTimer !== null) window.clearTimeout(closeTimer);
        closeTimer = window.setTimeout(() => {
          if (!panel.classList.contains("is-open")) panel.hidden = true;
          closeTimer = null;
        }, 140);
      };

      const onDocumentPointer = (event: PointerEvent) => {
        const target = event.target as Node | null;
        if (target && (panel.contains(target) || input.contains(target))) return;
        close();
      };
      const onSuggestionClick = (event: MouseEvent) => {
        const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".verdant-search-suggestion");
        if (!button) return;
        setInputValue(input, button.dataset.value || "");
        input.focus();
        render();
      };
      const onViewportChange = () => {
        if (!panel.hidden) updatePosition();
      };

      input.addEventListener("focus", open);
      input.addEventListener("input", open);
      input.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          close();
          input.blur();
        }
      });
      panel.addEventListener("click", onSuggestionClick);
      document.addEventListener("pointerdown", onDocumentPointer);
      window.addEventListener("resize", onViewportChange, { passive: true });
      window.addEventListener("scroll", onViewportChange, { passive: true });

      activeCleanup.current = () => {
        if (closeTimer !== null) window.clearTimeout(closeTimer);
        input.removeEventListener("focus", open);
        input.removeEventListener("input", open);
        panel.removeEventListener("click", onSuggestionClick);
        document.removeEventListener("pointerdown", onDocumentPointer);
        window.removeEventListener("resize", onViewportChange);
        window.removeEventListener("scroll", onViewportChange);
        panel.remove();
      };
    };

    if (pathname === "/shop") {
      setupTimer = window.setTimeout(setup, 60);
      const second = window.setTimeout(setup, 350);
      return () => {
        disposed = true;
        if (setupTimer !== null) window.clearTimeout(setupTimer);
        window.clearTimeout(second);
        teardown();
      };
    }

    teardown();
    return () => {
      disposed = true;
      if (setupTimer !== null) window.clearTimeout(setupTimer);
      teardown();
    };
  }, [pathname]);

  return null;
}
