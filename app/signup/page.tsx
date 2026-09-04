"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), password: form.get("password") }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(data?.error || "Unable to create your account."); return; }
      router.push("/account");
      router.refresh();
    } catch { setError("Unable to create your account. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-[#eef2df] px-5 py-6 text-[#101510] sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b-2 border-[#202d20]/15 pb-5">
          <Link href="/" className="text-sm font-black tracking-[0.2em] text-[#172217]">VERDANT</Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="rounded-full border-2 border-[#202d20] px-4 py-2 text-sm font-bold text-[#202d20] transition hover:bg-[#202d20] hover:text-[#f4f5e9]">Log in</Link>
            <Link href="/shop" className="rounded-full bg-[#202d20] px-4 py-2 text-sm font-bold text-[#f4f5e9] transition hover:bg-[#101510]">Shop plants</Link>
          </div>
        </header>

        <section className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 py-14 lg:grid-cols-[1fr_.82fr] lg:gap-16">
          <div>
            <p className="text-[10px] font-black tracking-[0.22em] text-[#315233]">WELCOME TO VERDANT</p>
            <h1 className="mt-4 max-w-2xl text-5xl font-black leading-[0.9] tracking-[-0.06em] sm:text-7xl">Make room for <span className="font-serif font-normal italic text-[#426a3f]">green.</span></h1>
            <p className="mt-6 max-w-lg text-sm font-medium leading-7 text-[#31422f] sm:text-base">Create your Verdant account to save your details, view order history and track your purchases.</p>
            <div className="mt-7 text-sm font-semibold text-[#263926]">Already have an account? <Link href="/login" className="underline decoration-2 underline-offset-4 hover:text-[#101510]">Log in</Link></div>
          </div>

          <div className="rounded-[32px] border-2 border-[#202d20]/15 bg-[#fafbf4] p-6 shadow-[0_18px_60px_rgba(32,45,32,0.12)] sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label htmlFor="name" className="text-xs font-bold text-[#263926]">Name</label><input id="name" name="name" required autoComplete="name" className="mt-2 h-12 w-full rounded-2xl border-2 border-[#202d20]/15 bg-[#eef2df] px-4 font-medium text-[#101510] outline-none focus:border-[#202d20]" /></div>
              <div><label htmlFor="email" className="text-xs font-bold text-[#263926]">Email</label><input id="email" name="email" type="email" required autoComplete="email" className="mt-2 h-12 w-full rounded-2xl border-2 border-[#202d20]/15 bg-[#eef2df] px-4 font-medium text-[#101510] outline-none focus:border-[#202d20]" /></div>
              <div><label htmlFor="password" className="text-xs font-bold text-[#263926]">Password</label><input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" className="mt-2 h-12 w-full rounded-2xl border-2 border-[#202d20]/15 bg-[#eef2df] px-4 font-medium text-[#101510] outline-none focus:border-[#202d20]" /></div>
              {error && <p role="alert" className="rounded-2xl border-2 border-red-900/15 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900">{error}</p>}
              <button type="submit" disabled={loading} className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-[#202d20] text-sm font-black text-[#f4f5e9] transition hover:bg-[#101510] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Creating account…" : "Create account"}</button>
              <p className="text-center text-xs font-medium leading-5 text-[#596654]">Your password is securely hashed before it is stored.</p>
            </form>
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t-2 border-[#202d20]/15 pt-5 text-[11px] font-semibold tracking-wide text-[#5a6857] sm:flex-row sm:items-center sm:justify-between"><span>© 2026 VERDANT</span><Link href="/" className="hover:text-[#202d20]">Back to home</Link></footer>
      </div>
    </main>
  );
}
