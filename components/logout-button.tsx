"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST", cache: "no-store" });
      if (!response.ok) throw new Error("Logout failed");
      router.replace("/login");
      router.refresh();
    } catch {
      setLoading(false);
      return;
    }
  };

  return (
    <button type="button" onClick={handleLogout} disabled={loading} className="rounded-full bg-[#202d20] px-5 py-2.5 text-sm font-bold text-[#f4f5e9] transition hover:bg-[#101510] disabled:opacity-60">
      {loading ? "Logging out…" : "Log out"}
    </button>
  );
}
