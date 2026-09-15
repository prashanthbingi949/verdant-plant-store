"use client";

import { useEffect } from "react";

export default function NewsletterEnhancer() {
  useEffect(() => {
    const forms = Array.from(document.querySelectorAll<HTMLFormElement>(".newsletter form"));
    if (!forms.length) return;

    const cleanups = forms.map((form) => {
      const input = form.querySelector<HTMLInputElement>('input[type="email"]');
      const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (!input || !button) return () => {};

      let status = form.querySelector<HTMLParagraphElement>(".newsletter-status");
      if (!status) {
        status = document.createElement("p");
        status.className = "newsletter-status";
        status.setAttribute("aria-live", "polite");
        form.appendChild(status);
      }

      const onSubmit = async (event: Event) => {
        event.preventDefault();
        status!.textContent = "";
        const email = input!.value.trim();
        if (!email) {
          input!.focus();
          status!.textContent = "Please enter your email address.";
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          input!.focus();
          status!.textContent = "Please enter a valid email address.";
          return;
        }

        const original = button!.textContent || "Join us";
        button!.disabled = true;
        button!.textContent = "Joining…";
        try {
          const response = await fetch("/api/newsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(String(data?.error || "Unable to join the list."));
          input!.value = "";
          status!.textContent = "You’re on the list. Welcome to Verdant.";
        } catch (error) {
          status!.textContent = error instanceof Error ? error.message : "Unable to join the list.";
        } finally {
          button!.disabled = false;
          button!.textContent = original;
        }
      };

      form.addEventListener("submit", onSubmit);
      return () => form.removeEventListener("submit", onSubmit);
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}
