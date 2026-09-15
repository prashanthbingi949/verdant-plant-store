"use client";

import { useEffect } from "react";

type NewsletterForm = HTMLFormElement & { dataset: DOMStringMap };

function ensureStatus(form: NewsletterForm) {
  let status = form.querySelector<HTMLParagraphElement>(".newsletter-status");
  if (!status) {
    status = document.createElement("p");
    status.className = "newsletter-status";
    status.setAttribute("aria-live", "polite");
    form.appendChild(status);
  }
  return status;
}

export default function NewsletterEnhancer() {
  useEffect(() => {
    const onSubmit = async (event: SubmitEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLFormElement) || !target.matches(".newsletter form")) return;

      event.preventDefault();
      const form = target as NewsletterForm;
      const input = form.querySelector<HTMLInputElement>('input[type="email"]');
      const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (!input || !button) return;

      const status = ensureStatus(form);
      status.textContent = "";

      const email = input.value.trim();
      if (!email) {
        input.focus();
        status.textContent = "Please enter your email address.";
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        input.focus();
        status.textContent = "Please enter a valid email address.";
        return;
      }

      if (button.disabled) return;

      const originalText = button.textContent || "Join us";
      button.disabled = true;
      button.textContent = "Joining…";

      try {
        const response = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(String(data?.error || "Unable to join the list."));
        }

        input.value = "";
        status.textContent = "You’re on the list. Welcome to Verdant.";
      } catch (error) {
        status.textContent = error instanceof Error ? error.message : "Unable to join the list.";
      } finally {
        button.disabled = false;
        button.textContent = originalText;
      }
    };

    document.addEventListener("submit", onSubmit);
    return () => document.removeEventListener("submit", onSubmit);
  }, []);

  return null;
}
