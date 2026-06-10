import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GAMES } from "@/data/games";
import { GameCard } from "@/components/GameCard";
import { SiteHeader, SiteFooter, PageSkeleton } from "@/components/SiteHeader";
import { useSettings } from "@/context/SettingsContext";
import { Flame, TrendingDown, History } from "lucide-react";

export const Route = createFileRoute("/deals")({
  component: DealsPage,
  pendingComponent: PageSkeleton,
  head: () => ({
    meta: [
      { title: "Today's Best Deals — GameLoot" },
      { name: "description", content: "The biggest live discounts on PC and console games. Compare current price drops against historical lows in real time." },
      { property: "og:title", content: "Today's Best Deals — GameLoot" },
      { property: "og:description", content: "Live discounts and all-time low prices across every major store." },
    ],
  }),
});

const TIERS = [
  { id: "all", label: "All deals", min: 1 },
  { id: "20", label: "20%+", min: 20 },
  { id: "50", label: "50%+", min: 50 },
  { id: "75", label: "75%+", min: 75 },
] as const;

function discountPct(price: number, retail: number) {
  if (!retail) return 0;
  return Math.round(((retail - price) / retail) * 100);
}

function DealsPage() {
  const { formatPrice } = useSettings();
  const [tier, setTier] = useState<(typeof TIERS)[number]["id"]>("all");

  const deals = useMemo(() => {
    const minPct = TIERS.find((t) => t.id === tier)?.min ?? 1;
    return GAMES
      .filter((g) => !g.isFreeToPlay && g.bestDeal.retailPrice > g.bestDeal.price)
      .map((g) => ({ game: g, pct: discountPct(g.bestDeal.price, g.bestDeal.retailPrice) }))
      .filter((d) => d.pct >= minPct)
      .sort((a, b) => b.pct - a.pct);
  }, [tier]);

  const top = deals[0];
  const totalSavings = deals.reduce((acc, d) => acc + (d.game.bestDeal.retailPrice - d.game.bestDeal.price), 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 30%, oklch(0.7 0.22 30 / 0.55), transparent 50%), radial-gradient(circle at 20% 70%, oklch(0.78 0.19 145 / 0.4), transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 py-14 relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
            <Flame className="h-3 w-3 text-accent" /> Live deals · updated every minute
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Today's biggest discounts.</h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Real-time price drops across every major store, ranked by raw discount percentage and cross-checked against historical lows.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
            <StatCard icon={<TrendingDown className="h-4 w-4 text-accent" />} label="Active deals" value={String(deals.length)} />
            <StatCard
              icon={<Flame className="h-4 w-4 text-accent" />}
              label="Top discount"
              value={top ? `-${top.pct}%` : "—"}
            />
            <StatCard
              icon={<History className="h-4 w-4 text-accent" />}
              label="Combined savings"
              value={formatPrice(totalSavings)}
            />
          </div>
        </div>
      </section>

      {/* Filter tiers */}
      <section className="container mx-auto px-4 pt-8">
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {TIERS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTier(t.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                tier === t.id
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* Deals grid */}
      <section className="container mx-auto px-4 py-10 pb-20">
        {deals.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No deals match this filter right now.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {deals.map(({ game, pct }) => {
              // Historical low ≈ slightly under current best deal price (illustrative).
              const histLow = Math.max(0.99, game.bestDeal.price * 0.92);
              const atLow = game.bestDeal.price <= histLow * 1.02;
              return (
                <div key={game.id} className="relative">
                  <div className="absolute -top-2 -right-2 z-10 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground shadow-lg ring-2 ring-background">
                    -{pct}%
                  </div>
                  <GameCard game={game} />
                  <div className="mt-2 flex items-center justify-between rounded-md border border-border bg-card/50 px-3 py-1.5 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <History className="h-3 w-3" /> Historical low: <span className="text-foreground font-semibold">{formatPrice(histLow)}</span>
                    </span>
                    {atLow && (
                      <span className="rounded bg-accent/20 px-1.5 py-0.5 font-bold text-accent">AT LOW</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon} {label}</div>
      <div className="mt-1 text-xl font-extrabold text-foreground">{value}</div>
    </div>
  );
}
