"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Unable to sign in.");
      router.replace("/admin/orders");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#202d20] px-5 py-10 text-[#f4f5e9] sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col justify-center">
        <Link href="/" className="text-xs font-extrabold tracking-[.2em] text-white/60">VERDANT / ADMIN</Link>
        <div className="mt-7 rounded-[32px] border border-white/10 bg-white/[.06] p-6 shadow-2xl backdrop-blur sm:p-8">
          <p className="text-[10px] font-bold tracking-[.18em] text-[#ddf27a]">PRIVATE AREA</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.05em]">Welcome back.</h1>
          <p className="mt-3 text-sm leading-6 text-white/55">Sign in to manage Verdant orders.</p>
          <form onSubmit={handleSubmit} className="mt-8">
            <label className="text-sm text-white/80">Admin password<input autoFocus required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/15 px-4 text-white outline-none placeholder:text-white/25 focus:border-[#ddf27a]/60" placeholder="Enter password" /></label>
            {error && <p role="alert" className="mt-3 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
            <button type="submit" disabled={loading} className="mt-5 h-12 w-full rounded-full bg-[#ddf27a] text-sm font-extrabold text-[#101510] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Signing in…" : "Sign in"}</button>
          </form>
        </div>
      </div>
    </main>
  );
}
