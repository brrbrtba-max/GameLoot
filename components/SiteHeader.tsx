import { Link, useRouter } from "@tanstack/react-router";
import { Gamepad2, Crown, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NotificationBell } from "./NotificationBell";
import { SettingsMenu } from "./SettingsMenu";
import { useSettings } from "@/context/SettingsContext";
import { initUiSounds } from "@/lib/sound";

export function SiteHeader() {
  const { t } = useSettings();
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);

  // Register the global tap-sound listener once (covers every page).
  useEffect(() => {
    initUiSounds();
  }, []);


  const handleReset = async () => {
    if (spinning) return;
    setSpinning(true);
    try {
      // Clear caches
      if (typeof window !== "undefined") {
        const keepKeys = new Set(["qp_settings", "qp_prime"]);
        Object.keys(localStorage).forEach((k) => {
          if (!keepKeys.has(k)) localStorage.removeItem(k);
        });
        sessionStorage.clear();
      }
      toast.success("Site data successfully reset.", {
        description: "Checking for new deals...",
      });
      await router.invalidate();
    } finally {
      setTimeout(() => setSpinning(false), 1200);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-12 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--gradient-hero)] shadow-[var(--shadow-glow)]">
            <Gamepad2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="font-extrabold text-base tracking-tight">
            Game<span className="text-primary">Loot</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-xs text-muted-foreground">
          <Link
            to="/deals"
            className="hover:text-foreground transition"
            activeProps={{ className: "text-foreground font-semibold" }}
          >
            {t("deals")}
          </Link>
          <Link
            to="/catalog"
            className="hover:text-foreground transition"
            activeProps={{ className: "text-foreground font-semibold" }}
          >
            {t("catalog")}
          </Link>
          <Link to="/" hash="free" className="hover:text-foreground transition">
            {t("free")}
          </Link>
          <Link
            to="/"
            hash="prime"
            className="hover:text-foreground transition inline-flex items-center gap-1 text-primary font-semibold"
          >
            <Crown className="h-3 w-3" /> {t("prime")}
          </Link>
        </nav>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReset}
            aria-label="Reset site data"
            className="sound-tap group relative inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary shadow-[0_0_20px_-8px_var(--color-primary)] transition-all hover:bg-primary/20 hover:shadow-[var(--shadow-glow)] active:scale-95"
          >
            <RefreshCw className={`h-3 w-3 ${spinning ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <NotificationBell />
          <SettingsMenu />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-8">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} GameLoot. Prices are illustrative — always verify on the store before buying.
      </div>
    </footer>
  );
}

export function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="h-8 w-64 animate-pulse rounded-md bg-muted mb-4" />
      <div className="h-4 w-96 max-w-full animate-pulse rounded-md bg-muted/70 mb-10" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="aspect-[16/9] animate-pulse bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted/70" />
              <div className="h-8 w-full animate-pulse rounded bg-muted/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
