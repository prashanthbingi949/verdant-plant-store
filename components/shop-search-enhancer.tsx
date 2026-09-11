"use client";

import { useEffect } from "react";

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
  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    const setup = () => {
      if (disposed || cleanup) return;
      const input = document.querySelector<HTMLInputElement>(".verdant-shop-page .shop-search");
      if (!input) return;

      const panel = document.createElement("div");
      panel.className = "verdant-search-panel";
      panel.setAttribute("role", "listbox");
      panel.setAttribute("aria-label", "Shop search suggestions");
      panel.hidden = true;
      document.body.appendChild(panel);

      const updatePosition = () => {
        const rect = input.getBoundingClientRect();
        const viewportPadding = 16;
        const width = Math.min(rect.width, window.innerWidth - viewportPadding * 2);
        const left = Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - width - viewportPadding));
        panel.style.width = `${width}px`;
        panel.style.left = `${left}px`;
        panel.style.top = `${rect.bottom + 10}px`;
      };

      const render = () => {
        const query = input.value.trim().toLowerCase();
        const values = (query ? SEARCH_HINTS.filter((item) => item.toLowerCase().includes(query)) : POPULAR).slice(0, 6);
        panel.innerHTML = `
          <div class="verdant-search-panel-head">
            <span>${query ? "Suggestions" : "Popular searches"}</span>
            <kbd>ESC</kbd>
          </div>
          <div class="verdant-search-suggestions">
            ${values.length ? values.map((value) => `<button type="button" class="verdant-search-suggestion" data-value="${value.replaceAll('"', '&quot;')}"><span class="verdant-search-suggestion-icon">⌕</span><span>${value}</span></button>`).join("") : '<div class="verdant-search-empty">No close matches yet — try another plant or garden essential.</div>'}
          </div>
        `;
      };

      const open = () => {
        panel.hidden = false;
        panel.classList.add("is-open");
        input.classList.add("is-search-focused");
        updatePosition();
        render();
      };

      const close = () => {
        panel.classList.remove("is-open");
        input.classList.remove("is-search-focused");
        window.setTimeout(() => {
          if (!panel.classList.contains("is-open")) panel.hidden = true;
        }, 140);
      };

      const onFocus = () => open();
      const onInput = () => {
        if (!panel.classList.contains("is-open")) open();
        render();
      };
      const onDocumentPointer = (event: PointerEvent) => {
        const target = event.target as Node;
        if (panel.contains(target) || input.contains(target)) return;
        close();
      };
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          close();
          input.blur();
        }
      };
      const onViewportChange = () => {
        if (!panel.hidden) updatePosition();
      };
      const onSuggestionClick = (event: MouseEvent) => {
        const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".verdant-search-suggestion");
        if (!button) return;
        const value = button.dataset.value || "";
        setInputValue(input, value);
        input.focus();
        render();
      };

      input.addEventListener("focus", onFocus);
      input.addEventListener("input", onInput);
      input.addEventListener("keydown", onKeyDown);
      panel.addEventListener("click", onSuggestionClick);
      document.addEventListener("pointerdown", onDocumentPointer);
      window.addEventListener("resize", onViewportChange, { passive: true });
      window.addEventListener("scroll", onViewportChange, { passive: true });

      cleanup = () => {
        input.removeEventListener("focus", onFocus);
        input.removeEventListener("input", onInput);
        input.removeEventListener("keydown", onKeyDown);
        panel.removeEventListener("click", onSuggestionClick);
        document.removeEventListener("pointerdown", onDocumentPointer);
        window.removeEventListener("resize", onViewportChange);
        window.removeEventListener("scroll", onViewportChange);
        panel.remove();
        cleanup = undefined;
      };
    };

    const observer = new MutationObserver(setup);
    observer.observe(document.body, { childList: true, subtree: true });
    setup();

    return () => {
      disposed = true;
      observer.disconnect();
      cleanup?.();
    };
  }, []);

  return null;
}
