import { useEffect, useMemo, useState } from "react";
import { GAMES, PLATFORM_TABS, GENRE_CATEGORIES, gameMatchesCategory, type Platform } from "@/data/games";
import { GameCard } from "./GameCard";
import { Flame, Search, ChevronLeft, ChevronRight, RefreshCw, Sparkles } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useLiveTick, liveDiscountScore } from "@/lib/live";

const PAGE_SIZE = 12;

function discountPct(price: number, retail: number) {
  if (!retail || retail === 0) return 0;
  return Math.round(((retail - price) / retail) * 100);
}

export function GameCatalog() {
  const { t, isRTL, language } = useSettings();
  const [tab, setTab] = useState<"All" | Platform>("All");
  const [genre, setGenre] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // Shared live heartbeat — keeps the "hottest deals" feeling fresh/active.
  const { tick, refresh } = useLiveTick();

  // Exclude F2P from main catalog — they live in the dedicated Free Games hub.
  const sorted = useMemo(
    () => [...GAMES].filter((g) => !g.isFreeToPlay).sort((a, b) => b.popularity - a.popularity),
    [],
  );

  // "Recommended For You" — intelligently blends the steepest discount with the
  // title's popularity (a proxy for rating) so the best value+quality bubbles up.
  const recommended = useMemo(() => {
    return sorted
      .map((g) => {
        const pct = discountPct(g.bestDeal.price, g.bestDeal.retailPrice);
        // Weighted score: discount drives value, popularity rewards quality,
        // and the live tick gently rotates near-ties for a fresh feed.
        const score =
          pct * 1.2 +
          g.popularity * 0.6 +
          liveDiscountScore(g.id, g.bestDeal.price, g.bestDeal.retailPrice, tick, 0.15) * 10;
        return { g, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((x) => x.g);
  }, [sorted, tick]);

  // Re-rank the discounted pool on each live tick so the spotlight rotates
  // through genuinely on-sale titles instead of showing the same 4 forever.
  const hotDeals = useMemo(() => {
    const eligible = sorted.filter(
      (g) => g.bestDeal.retailPrice > 0 && g.bestDeal.price < g.bestDeal.retailPrice,
    );
    return eligible
      .map((g) => ({
        g,
        score: liveDiscountScore(g.id, g.bestDeal.price, g.bestDeal.retailPrice, tick, 0.25),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((x) => x.g);
  }, [sorted, tick]);

  const filtered = useMemo(() => {
    return sorted.filter((g) => {
      const matchesTab = tab === "All" || g.platforms.includes(tab);
      const matchesGenre = gameMatchesCategory(g.genre, genre);
      const matchesQuery = !query || g.title.toLowerCase().includes(query.toLowerCase());
      return matchesTab && matchesGenre && matchesQuery;
    });
  }, [sorted, tab, genre, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [tab, genre, query]);

  function changePage(next: number) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      {/* Recommended For You */}
      <section className="container mx-auto px-4 py-10 sm:py-12">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary ring-1 ring-primary/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-foreground">
              {isRTL ? "الموصى به لك" : "Recommended For You"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isRTL ? "أكبر الخصومات وأعلى التقييمات المختارة لك." : "Biggest discounts & top-rated picks, curated for you."}
            </p>
          </div>
        </div>
        <div key={`rec-${tick}`} className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {recommended.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      </section>

      {/* Hot Deals */}
      <section className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent ring-1 ring-accent/30">
            <Flame className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-foreground">
              {t("hottestDeals")}
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase text-primary ring-1 ring-primary/30">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                {isRTL ? "مباشر" : "Live"}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{t("hottestSub")}</p>
          </div>
          <button
            onClick={refresh}
            aria-label="Refresh deals"
            className="sound-tap inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary/70 active:scale-95"
          >
            <RefreshCw className="h-3.5 w-3.5" /> {isRTL ? "تحديث" : "Refresh"}
          </button>
        </div>
        <div key={`hot-${tick}`} className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {hotDeals.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      </section>

      {/* Catalog */}
      <section className="container mx-auto px-4 pb-20">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">{t("trending")}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{t("trendingSub")}</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("searchPlaceholderCatalog")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-input/50 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Platform Tabs — scrollable horizontal row on mobile */}
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
          {PLATFORM_TABS.map((p) => (
            <button
              key={p}
              onClick={() => setTab(p)}
              className={`sound-tap shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                tab === p
                  ? "bg-primary text-primary-foreground shadow-md neon-active"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Smart Genre / Category filter bar — scrollable horizontal row */}
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2 border-b border-border">
          {GENRE_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setGenre(c.id)}
              className={`sound-tap shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                genre === c.id
                  ? "border-accent/70 bg-accent/15 text-accent neon-active"
                  : "border-border bg-card/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              {language === "ar" ? c.label.ar : c.label.en}
            </button>
          ))}
        </div>

        {pageItems.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">{t("noResults")}</div>
        ) : (
          <div
            key={`page-${safePage}-${tab}-${genre}-${query}`}
            className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"
          >
            {pageItems.map((g) => <GameCard key={g.id} game={g} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => changePage(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              className="sound-tap inline-flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/70 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => changePage(n)}
                className={`sound-tap min-w-9 rounded-lg px-3 py-2 text-sm font-bold transition ${
                  n === safePage
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-foreground hover:bg-secondary/70"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => changePage(Math.min(totalPages, safePage + 1))}
              disabled={safePage === totalPages}
              className="sound-tap inline-flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/70 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>
    </>
  );
}
