"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function SignUpPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#f4f5e9] px-5 py-8 text-[#101510] sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-between">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm font-extrabold tracking-[0.18em]">VERDANT</Link>
          <Link href="/shop" className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold hover:bg-black/5">Shop plants</Link>
        </header>

        <section className="mx-auto grid w-full max-w-4xl gap-12 py-16 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-black/50">WELCOME TO VERDANT</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[0.94] tracking-[-0.05em] sm:text-7xl">
              Make room for <span className="font-serif italic font-normal">green.</span>
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-7 text-black/60 sm:text-base">
              Create your Verdant account to keep your details handy and make future orders easier.
            </p>
          </div>

          <div className="rounded-[32px] border border-black/10 bg-white/50 p-6 shadow-sm sm:p-8">
            {submitted ? (
              <div className="py-10 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#ddf27a] text-xl">✓</div>
                <h2 className="mt-5 text-2xl font-semibold">You're on the list.</h2>
                <p className="mt-2 text-sm leading-6 text-black/55">
                  Your sign-up details were received. Account authentication can be connected here when the customer-account system is enabled.
                </p>
                <Link href="/shop" className="mt-6 inline-flex rounded-full bg-[#202d20] px-5 py-3 text-sm font-bold text-[#f4f5e9]">Continue shopping</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="text-xs font-semibold text-black/60">Name</label>
                  <input id="name" name="name" required autoComplete="name" className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 outline-none focus:border-black/25" />
                </div>
                <div>
                  <label htmlFor="email" className="text-xs font-semibold text-black/60">Email</label>
                  <input id="email" name="email" type="email" required autoComplete="email" className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 outline-none focus:border-black/25" />
                </div>
                <div>
                  <label htmlFor="password" className="text-xs font-semibold text-black/60">Password</label>
                  <input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 outline-none focus:border-black/25" />
                </div>
                <button type="submit" className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-[#202d20] text-sm font-bold text-[#f4f5e9] transition hover:bg-[#101510]">
                  Create account
                </button>
                <p className="text-center text-xs leading-5 text-black/45">
                  We don't store your password yet. This page is ready for the account-authentication integration.
                </p>
              </form>
            )}
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-black/10 pt-5 text-[11px] tracking-wide text-black/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 VERDANT</span>
          <Link href="/" className="hover:text-black/70">Back to home</Link>
        </footer>
      </div>
    </main>
  );
}
