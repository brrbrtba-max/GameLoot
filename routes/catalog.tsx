import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { GAMES, PLATFORM_TABS, type Platform } from "@/data/games";
import { GameCard } from "@/components/GameCard";
import { SiteHeader, SiteFooter, PageSkeleton } from "@/components/SiteHeader";
import { AdBanner } from "@/components/AdBanner";
import { useSettings } from "@/context/SettingsContext";
import { Search, Library, Filter, Tag, LayoutGrid } from "lucide-react";

// Stores grouped by the platform they belong to. Drives the dynamic STORE
// filter so PC-only storefronts hide when a console platform is selected.
const STORES_BY_PLATFORM: Record<"All" | Platform, string[]> = {
  All: ["All", "Steam", "Epic Games Store", "GOG", "Humble Store", "PlayStation Store", "Xbox", "Nintendo eShop"],
  PC: ["All", "Steam", "Epic Games Store", "GOG", "Humble Store"],
  PlayStation: ["All", "PlayStation Store"],
  Xbox: ["All", "Xbox", "Microsoft Store"],
  "Nintendo Switch": ["All", "Nintendo eShop"],
};

function discountPct(price: number, retail: number) {
  if (!retail || retail === 0) return 0;
  return Math.round(((retail - price) / retail) * 100);
}

export const Route = createFileRoute("/catalog")({
  component: CatalogPage,
  pendingComponent: PageSkeleton,
  head: () => ({
    meta: [
      { title: "Game Catalog — GameLoot" },
      { name: "description", content: "Browse the full GameLoot catalog. Filter by platform, store and genre to find your next favorite game at the best price." },
      { property: "og:title", content: "Game Catalog — GameLoot" },
      { property: "og:description", content: "Browse and filter games by platform, store, and genre." },
    ],
  }),
});

function CatalogPage() {
  const { t, isRTL } = useSettings();
  const [platform, setPlatform] = useState<"All" | Platform>("All");
  const [genre, setGenre] = useState<string>("All");
  const [store, setStore] = useState<string>("All");
  const [query, setQuery] = useState("");

  const genres = useMemo(() => {
    const set = new Set<string>();
    GAMES.forEach((g) => g.genre && set.add(g.genre));
    return ["All", ...Array.from(set).sort()];
  }, []);

  // Store options adapt to the selected platform.
  const storeOptions = STORES_BY_PLATFORM[platform];

  // Reset the store filter when it's no longer valid for the chosen platform.
  useEffect(() => {
    if (!storeOptions.includes(store)) setStore("All");
  }, [platform, storeOptions, store]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return [...GAMES]
      .sort((a, b) => b.popularity - a.popularity)
      .filter((g) => {
        if (platform !== "All" && !g.platforms.includes(platform)) return false;
        if (genre !== "All" && g.genre !== genre) return false;
        if (store !== "All") {
          const stores = [g.bestDeal.store, ...(g.alternateDeals?.map((d) => d.store) ?? [])];
          if (!stores.some((s) => s.toLowerCase().includes(store.toLowerCase()))) return false;
        }
        if (q && !g.title.toLowerCase().includes(q)) return false;
        return true;
      });
  }, [platform, genre, store, query]);

  // Two-tier split: active discounts first, then everything else (incl. full price).
  const activeDeals = useMemo(
    () => filtered.filter((g) => !g.isFreeToPlay && discountPct(g.bestDeal.price, g.bestDeal.retailPrice) > 0),
    [filtered],
  );
  const allOther = useMemo(
    () => filtered.filter((g) => !activeDeals.includes(g)),
    [filtered, activeDeals],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="container mx-auto px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Library className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{t("catalog")}</h1>
            <p className="text-xs text-muted-foreground">Browse every tracked title — filter by platform, store and genre.</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-5">
        <div className="rounded-xl border border-border bg-card/40 p-4 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search games by title…"
              className="w-full rounded-lg border border-border bg-input/50 pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FilterGroup label="Platform" icon={<Filter className="h-3.5 w-3.5" />}>
              {PLATFORM_TABS.map((p) => (
                <Chip key={p} active={platform === p} onClick={() => setPlatform(p)}>
                  {p}
                </Chip>
              ))}
            </FilterGroup>
            <FilterGroup label="Store" icon={<Filter className="h-3.5 w-3.5" />}>
              {storeOptions.map((s) => (
                <Chip key={s} active={store === s} onClick={() => setStore(s)}>
                  {s}
                </Chip>
              ))}
            </FilterGroup>
            <FilterGroup label="Genre" icon={<Filter className="h-3.5 w-3.5" />}>
              {genres.map((g) => (
                <Chip key={g} active={genre === g} onClick={() => setGenre(g)}>
                  {g}
                </Chip>
              ))}
            </FilterGroup>
          </div>
        </div>
      </section>

      {/* Responsive banner placeholder filling the search-results area */}
      <section className="container mx-auto px-4 pb-6">
        <AdBanner label="Search results banner" />
      </section>

      <section className="container mx-auto px-4 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No games match your filters.</div>
        ) : (
          <>
            {/* Section 1 — Active Deals & Offers */}
            {activeDeals.length > 0 && (
              <div className="mb-12">
                <div className="mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-accent" />
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    {isRTL ? "العروض والتخفيضات الحالية" : "Active Deals & Offers"}
                  </h2>
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-accent ring-1 ring-accent/30">
                    {activeDeals.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                  {activeDeals.map((g) => <GameCard key={g.id} game={g} platformContext={platform} />)}
                </div>
              </div>
            )}

            {/* Section 2 — All Available Games */}
            {allOther.length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5 text-primary" />
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    {isRTL ? "كل الألعاب المتاحة" : "All Available Games"}
                  </h2>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary ring-1 ring-primary/30">
                    {allOther.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                  {allOther.map((g) => <GameCard key={g.id} game={g} platformContext={platform} />)}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}

function FilterGroup({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground mb-2">
        {icon} {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`sound-tap rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? "bg-primary text-primary-foreground shadow"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
      }`}
    >
      {children}
    </button>
  );
}
