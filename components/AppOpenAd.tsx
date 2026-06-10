import { useEffect, useState } from "react";
import { X, Sparkles, Crown } from "lucide-react";

// Mockup "App Open" interstitial ad. Shows once per browser session on startup
// with a clear Skip button. Purely a placeholder — no real ad network.
export function AppOpenAd() {
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("gl_app_open_ad_shown")) return;
    sessionStorage.setItem("gl_app_open_ad_shown", "1");
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [open, countdown]);

  if (!open) return null;

  const canSkip = countdown <= 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md p-4 animate-fade-up">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-primary/40 p-8 text-center"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.05 270) 0%, oklch(0.18 0.04 250) 50%, oklch(0.25 0.08 280) 100%)",
          boxShadow: "var(--shadow-glow), 0 0 60px oklch(0.7 0.18 280 / 0.3)",
        }}
      >
        <div className="absolute right-3 top-3 rounded bg-background/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          Ad
        </div>
        <button
          onClick={() => canSkip && setOpen(false)}
          disabled={!canSkip}
          className="sound-tap absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-border bg-background/50 px-2.5 py-1 text-[11px] font-bold text-foreground transition hover:bg-background/80 disabled:opacity-50"
        >
          <X className="h-3 w-3" />
          {canSkip ? "Skip" : `Skip in ${countdown}`}
        </button>

        <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary ring-1 ring-primary/40">
          <Crown className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-foreground">Go Premium with GameLoot Prime</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Unlock instant giveaway alerts, AI price predictions & hidden coupons. Limited promo — just $3/mo.
        </p>
        <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent ring-1 ring-accent/30">
          <Sparkles className="h-3.5 w-3.5" /> Sponsored placement
        </div>
      </div>
    </div>
  );
}
