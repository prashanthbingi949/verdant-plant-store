"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token") || "";
    setToken(value);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!token) {
      setError("This password reset link is missing or invalid.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Unable to reset your password.");
      setPassword("");
      setConfirm("");
      setMessage("Your password has been reset. You can now log in with your new password.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#eef2df] px-5 py-6 text-[#101510] sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b-2 border-[#202d20]/15 pb-5">
          <Link href="/" className="text-sm font-black tracking-[0.2em] text-[#172217]">VERDANT</Link>
          <Link href="/shop" className="rounded-full bg-[#202d20] px-4 py-2 text-sm font-bold !text-[#f4f5e9] transition hover:bg-[#101510]">Shop plants</Link>
        </header>

        <section className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center py-14">
          <div className="w-full max-w-xl rounded-[32px] border-2 border-[#202d20]/15 bg-[#fafbf4] p-6 shadow-[0_18px_60px_rgba(32,45,32,0.12)] sm:p-8">
            <p className="text-[10px] font-black tracking-[0.22em] text-[#315233]">ACCOUNT ACCESS</p>
            <h1 className="mt-4 text-5xl font-black leading-[0.9] tracking-[-0.06em] sm:text-6xl">Choose a new <span className="font-serif font-normal italic text-[#426a3f]">password.</span></h1>
            <p className="mt-5 text-sm leading-7 text-[#596654]">Use at least 8 characters. Your reset link expires after 30 minutes.</p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div>
                <label htmlFor="password" className="text-xs font-bold text-[#263926]">New password</label>
                <input id="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-2xl border-2 border-[#202d20]/15 bg-[#eef2df] px-4 font-medium text-[#101510] outline-none focus:border-[#202d20]" />
              </div>
              <div>
                <label htmlFor="confirm" className="text-xs font-bold text-[#263926]">Confirm password</label>
                <input id="confirm" type="password" required minLength={8} maxLength={128} autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} className="mt-2 h-12 w-full rounded-2xl border-2 border-[#202d20]/15 bg-[#eef2df] px-4 font-medium text-[#101510] outline-none focus:border-[#202d20]" />
              </div>
              {message && <p role="status" className="rounded-2xl border-2 border-emerald-900/10 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">{message}</p>}
              {error && <p role="alert" className="rounded-2xl border-2 border-red-900/15 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900">{error}</p>}
              <button type="submit" disabled={loading || !token} className="flex h-12 w-full items-center justify-center rounded-full bg-[#202d20] !text-[#f4f5e9] text-sm font-black transition hover:bg-[#101510] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Resetting…" : "Reset password"}</button>
            </form>

            <div className="mt-6 text-sm font-semibold text-[#263926]"><Link href="/login" className="underline decoration-2 underline-offset-4">Back to log in</Link></div>
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t-2 border-[#202d20]/15 pt-5 text-[11px] font-semibold tracking-wide text-[#5a6857] sm:flex-row sm:items-center sm:justify-between"><span>© 2026 VERDANT</span><Link href="/" className="hover:text-[#202d20]">Back to home</Link></footer>
      </div>
    </main>
  );
}
