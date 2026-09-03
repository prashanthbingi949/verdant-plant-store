"use client";

type Status = "awaiting_payment" | "paid" | "packed" | "shipped" | "delivered" | "cancelled";

const steps: Array<{ key: Exclude<Status, "awaiting_payment" | "cancelled">; label: string; short: string }> = [
  { key: "paid", label: "Paid", short: "Confirmed" },
  { key: "packed", label: "Packed", short: "Preparing" },
  { key: "shipped", label: "Shipped", short: "On the way" },
  { key: "delivered", label: "Delivered", short: "Arrived" },
];

export default function TrackingProgress({ status }: { status: Status }) {
  const currentIndex = status === "awaiting_payment" ? -1 : steps.findIndex((step) => step.key === status);
  const isCancelled = status === "cancelled";

  return (
    <div className="mt-7">
      <div className="hidden sm:flex items-start">
        {steps.map((step, index) => {
          const complete = !isCancelled && index <= currentIndex;
          const current = !isCancelled && index === currentIndex;
          return (
            <div key={step.key} className="relative flex min-w-0 flex-1 flex-col items-center text-center">
              {index < steps.length - 1 && (
                <div className={`absolute left-1/2 top-5 h-px w-full ${!isCancelled && index < currentIndex ? "bg-[#ddf27a]" : "bg-white/10"}`} />
              )}
              <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border text-xs font-bold ${complete ? "border-[#ddf27a] bg-[#ddf27a] text-[#101510]" : "border-white/15 bg-[#273427] text-white/25"}`}>
                {complete ? "✓" : index + 1}
              </div>
              <p className={`mt-3 text-xs font-semibold ${complete ? "text-white" : "text-white/35"}`}>{step.label}</p>
              <p className="mt-1 text-[10px] text-white/35">{current ? "Current status" : step.short}</p>
            </div>
          );
        })}
      </div>

      <div className="sm:hidden space-y-3">
        {steps.map((step, index) => {
          const complete = !isCancelled && index <= currentIndex;
          const current = !isCancelled && index === currentIndex;
          return (
            <div key={step.key} className={`flex items-center gap-3 rounded-2xl px-3 py-3 ${current ? "bg-[#ddf27a] text-[#101510]" : "bg-white/5"}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${complete ? "bg-[#ddf27a] text-[#101510]" : "border border-white/15 text-white/30"}`}>
                {complete ? "✓" : index + 1}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${current ? "text-[#101510]" : complete ? "text-white" : "text-white/40"}`}>{step.label}</p>
                <p className={`mt-0.5 text-[10px] ${current ? "text-[#101510]/60" : "text-white/30"}`}>{current ? "Current status" : step.short}</p>
              </div>
              {current && <span className="ml-auto rounded-full bg-[#202d20] px-2 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#ddf27a]">Now</span>}
            </div>
          );
        })}
      </div>

      {isCancelled && (
        <div className="mt-4 rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          This order has been cancelled. Please contact Verdant if you need help.
        </div>
      )}
    </div>
  );
}
