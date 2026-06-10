import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ExternalLink, Loader2, Radio, Flame } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { GAMES } from "@/data/games";
import { GameCard } from "./GameCard";

const STORE_MAP: Record<string, string> = {
  "1": "Steam", "2": "GamersGate", "3": "GreenManGaming", "7": "GOG",
  "8": "Origin", "11": "Humble Store", "13": "Uplay", "15": "Fanatical",
  "21": "WinGameStore", "23": "GameBillet", "24": "Voidu", "25": "Epic Games Store",
  "27": "Gamesplanet", "28": "Gamesload", "29": "2Game", "30": "IndieGala",
  "31": "Blizzard Shop", "32": "AllYouPlay", "33": "DLGamer", "34": "Noctre", "35": "DreamGame",
};

interface ApiDeal {
  dealID: string;
  title: string;
  storeID: string;
  thumb: string;
  normalPrice: string;
  salePrice: string;
  savings: string;
  steamAppID?: string | null;
}

export function LiveSearch() {
  const { formatPrice, t, currencyNote, language } = useSettings();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<ApiDeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Pre-search "Suggested Deals" — pick games with strong active discount (>=50%).
  const suggested = useMemo(
    () =>
      [...GAMES]
        .filter((g) => !g.isFreeToPlay && g.bestDeal.retailPrice > 0)
        .filter((g) => {
          const pct = (g.bestDeal.retailPrice - g.bestDeal.price) / g.bestDeal.retailPrice;
          return pct >= 0.5;
        })
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 8),
    [],
  );

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]); setError(null); setLoading(false);
      return;
    }
    const timeout = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true); setError(null);
      fetch(
        `https://www.cheapshark.com/api/1.0/deals?title=${encodeURIComponent(q)}&limit=12`,
        { signal: controller.signal },
      )
        .then((r) => {
          if (!r.ok) throw new Error("bad-status");
          return r.json();
        })
        .then((data: ApiDeal[]) => {
          const clean = (data || []).filter(
            (g) => g.title && !g.title.toLowerCase().includes("ai-generated"),
          );
          setResults(clean);
        })
        .catch((err) => { if (err.name !== "AbortError") setError("live-feed-down"); })
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(timeout);
  }, [query]);

  const showResults = query.trim().length >= 2;
  const showSuggested = !showResults && focused;

  // Offline-safe fallback: filter the internal GameLoot library so the search
  // never feels broken when the external price API throttles or fails.
  const localResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return GAMES.filter((g) => g.title.toLowerCase().includes(q)).slice(0, 12);
  }, [query]);

  // Use the local library whenever the API errored OR returned nothing.
  const useFallback = showResults && !loading && (!!error || results.length === 0);

  const dealUrl = (d: ApiDeal) => {
    // Precise Steam URL when CheapShark exposes the Steam AppID.
    if (d.storeID === "1" && d.steamAppID) {
      return `https://store.steampowered.com/app/${d.steamAppID}/`;
    }
    return `https://www.cheapshark.com/redirect?dealID=${d.dealID}`;
  };

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-6 md:p-8">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Live Search</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
          {language === "ar" ? "ابحث عن أي لعبة في كل المتاجر" : "Search any game across every store"}
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          {language === "ar"
            ? "أسعار فورية من ستيم، إيبيك، GOG، Humble، Fanatical و40+ متجراً."
            : "Real-time prices from Steam, Epic, GOG, Humble, Fanatical and 40+ more — powered by CheapShark."}
        </p>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder={t("searchPlaceholderLive")}
            className="w-full rounded-xl border border-border bg-input/50 pl-12 pr-12 py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary animate-spin" />
          )}
        </div>
        {currencyNote && (
          <div className="mt-3 text-xs text-muted-foreground italic">{currencyNote}</div>
        )}

        {showSuggested && suggested.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-4 w-4 text-accent" />
              <div>
                <div className="text-sm font-bold text-foreground">{t("suggestedDeals")}</div>
                <div className="text-xs text-muted-foreground">{t("suggestedSub")}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {suggested.map((g) => <GameCard key={g.id} game={g} />)}
            </div>
          </div>
        )}

        {showResults && (
          <div className="mt-6">
            {/* Live API results */}
            {!useFallback && results.length > 0 && (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
                {results.map((d) => {
                  const store = STORE_MAP[d.storeID] || "Retail Store";
                  const sale = parseFloat(d.salePrice);
                  const normal = parseFloat(d.normalPrice);
                  const pct = Math.round(parseFloat(d.savings || "0"));
                  const isFree = sale === 0;
                  const dealLabel = language === "ar" ? `صفقة في ${store}` : `Deal on ${store}`;
                  return (
                    <li
                      key={d.dealID}
                      className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3 hover:border-primary/50 transition"
                    >
                      <div className="h-14 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        {d.thumb ? (
                          <img src={d.thumb} alt={d.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-foreground truncate">{d.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{dealLabel}</div>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className={`text-base font-extrabold ${isFree ? "text-accent" : "text-foreground"}`}>
                            {isFree ? (language === "ar" ? "مجاناً" : "FREE") : formatPrice(sale)}
                          </span>
                          {pct > 0 && (
                            <>
                              <span className="text-xs text-muted-foreground line-through">{formatPrice(normal)}</span>
                              <span className="text-[10px] font-bold text-primary">-{pct}%</span>
                            </>
                          )}
                        </div>
                      </div>
                      <a
                        href={dealUrl(d)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow hover:brightness-110 active:scale-95"
                      >
                        {isFree ? (language === "ar" ? "احصل" : "Get") : (language === "ar" ? "اشترِ" : "Buy")} <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Offline-safe fallback to the internal GameLoot library */}
            {useFallback && localResults.length > 0 && (
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                  <Flame className="h-3.5 w-3.5 text-accent" />
                  {language === "ar"
                    ? "نتائج من مكتبة GameLoot (وضع غير متصل)"
                    : "Showing GameLoot library matches (offline mode)"}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {localResults.map((g) => <GameCard key={g.id} game={g} />)}
                </div>
              </div>
            )}

            {/* Nothing anywhere */}
            {useFallback && localResults.length === 0 && (
              <div className="text-sm text-muted-foreground py-6 text-center">
                {language === "ar" ? "لا توجد ألعاب مطابقة لبحثك." : "No games matched your search."}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
