import { useState } from "react";
import { getSystemReqs, type Game } from "@/data/games";
import { ExternalLink, Tag, Gamepad2, Play, Cpu, MemoryStick, MonitorCog, ChevronDown, Loader2, Radio } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { PriceAlertButton } from "./PriceAlertButton";
import { useLivePrice } from "@/lib/cheapshark";

function discountPct(price: number, retail: number) {
  if (!retail || retail === 0) return 0;
  return Math.round(((retail - price) / retail) * 100);
}

// Hardcoded high-quality fallback covers for titles whose primary CDN
// often blocks hotlinking or returns 404. Keyed by lowercase title.
const COVER_FALLBACKS: Record<string, string> = {
  "minecraft":
    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2420770/header.jpg",
  "roblox":
    "https://images.crazygames.com/roblox/20240208044819/roblox-cover?metadata=none&quality=85&width=1200&fit=crop",
  "call of duty: warzone":
    "https://cdn.cloudflare.steamstatic.com/steam/apps/1962663/header.jpg",
  "valorant":
    "https://cdn.cloudflare.steamstatic.com/steam/apps/2762340/header.jpg",
  "league of legends":
    "https://cmsassets.rgpub.io/sanity/images/dsfx7636/news/4dbc88af3a2c43c97c2eef0d99e2c8af3416ac9d-1920x1080.jpg",
};

function GameImage({ src, alt }: { src: string; alt: string }) {
  const fallback = COVER_FALLBACKS[alt.toLowerCase()];
  const initial = src && src.length > 0 ? src : fallback || "";
  const [currentSrc, setCurrentSrc] = useState(initial);
  const [triedFallback, setTriedFallback] = useState(!fallback || initial === fallback);
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    if (!triedFallback && fallback) {
      setCurrentSrc(fallback);
      setTriedFallback(true);
    } else {
      setFailed(true);
    }
  };

  if (failed || !currentSrc) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--gradient-card)] text-muted-foreground">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, oklch(0.78 0.19 145 / 0.5), transparent 40%), radial-gradient(circle at 80% 70%, oklch(0.7 0.18 250 / 0.5), transparent 40%)",
          }}
        />
        <Gamepad2 className="relative h-12 w-12 mb-2 text-primary/70" strokeWidth={1.5} />
        <div className="relative px-3 text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground/70">No cover yet</div>
          <div className="mt-1 text-sm font-semibold text-foreground/90 line-clamp-2">{alt}</div>
        </div>
      </div>
    );
  }
  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      onError={handleError}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}

// Loading overlay shown when buying — "Redirecting to store... supporting GameLoot".
function RedirectOverlay() {
  return (
    <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md p-6 text-center animate-fade-up">
      <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
      <div className="text-lg font-extrabold text-foreground">Redirecting to store…</div>
      <div className="mt-1 text-sm text-muted-foreground">supporting <span className="font-bold text-primary">GameLoot</span></div>
    </div>
  );
}

export function GameCard({ game, platformContext }: { game: Game; platformContext?: string }) {
  const { formatPrice, t, currencyNote, isRTL } = useSettings();
  const [showReqs, setShowReqs] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Best-effort live price from CheapShark; falls back to the static deal.
  const live = useLivePrice(game.title, !game.isFreeToPlay);
  const price = live ? live.price : game.bestDeal.price;
  const retailPrice = live ? live.retailPrice : game.bestDeal.retailPrice;
  const storeName = live ? live.store : game.bestDeal.store;

  const pct = discountPct(price, retailPrice);
  const onSale = pct > 0 && !game.isFreeToPlay;
  const isPC = game.platforms.includes("PC");
  // System requirements are PC-only. When a console platform is the active
  // filter (PlayStation / Xbox / Nintendo Switch), hide the section entirely.
  const platformAllowsReqs = !platformContext || platformContext === "All" || platformContext === "PC";
  const reqs = isPC && platformAllowsReqs ? getSystemReqs(game) : null;

  const handleBuy = (e: React.MouseEvent) => {
    if (game.isFreeToPlay) return; // free games open instantly
    e.preventDefault();
    setRedirecting(true);
    setTimeout(() => {
      window.open(game.bestDeal.url, "_blank", "noopener,noreferrer");
      setRedirecting(false);
    }, 1400);
  };

  return (
    <article className="group relative overflow-hidden rounded-lg sm:rounded-xl border border-border bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:border-primary/60 hover:-translate-y-1 hover:shadow-[var(--shadow-glow)] animate-fade-up">
      {redirecting && <RedirectOverlay />}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <GameImage src={game.image} alt={game.title} />
        {onSale && (
          <div className={`absolute top-2 left-2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground shadow-lg ${pct >= 75 ? "animate-neon-pulse bg-accent text-accent-foreground" : ""}`}>
            -{pct}%{pct >= 75 ? " 🔥" : ""}
          </div>
        )}
        {game.isFreeToPlay && (
          <div className="absolute top-2 left-2 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground shadow-lg">
            FREE-TO-PLAY
          </div>
        )}
        {live && (
          <div className="absolute top-2 right-2 inline-flex items-center gap-1 rounded bg-background/70 px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary backdrop-blur">
            <Radio className="h-2.5 w-2.5 animate-pulse" /> Live
          </div>
        )}
      </div>

      <div className="p-2.5 sm:p-4 flex flex-col gap-2 sm:gap-3">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-1">{game.title}</h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{game.genre}</p>
        </div>

        {/* Smaller platform chips in a neat scrollable horizontal row */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-0.5 px-0.5">
          {game.platforms.map((p) => (
            <span
              key={p}
              className="shrink-0 rounded bg-secondary/70 px-1.5 py-0.5 text-[9px] font-medium text-foreground/80 border border-border/50"
            >
              {p === "Nintendo Switch" ? "Switch" : p}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
          <Tag className="h-3 w-3 text-primary shrink-0" />
          <span className="truncate">
            {game.isFreeToPlay ? "On " : "Deal on "}
            <span className="font-semibold text-foreground">{storeName}</span>
            {!live && game.bestDeal.storeNote && <span className="text-muted-foreground"> ({game.bestDeal.storeNote})</span>}
          </span>
        </div>

        {/* Price row — full width, separate from the action row so the
            strikethrough price never overlaps the notification bell. */}
        <div className="min-w-0">
          {game.isFreeToPlay ? (
            <div className="text-lg sm:text-2xl font-extrabold text-accent">FREE</div>
          ) : (
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <div className="text-lg sm:text-2xl font-extrabold text-foreground">{formatPrice(price)}</div>
              {onSale && (
                <div className="text-xs sm:text-sm text-muted-foreground line-through">{formatPrice(retailPrice)}</div>
              )}
            </div>
          )}
          {currencyNote && !game.isFreeToPlay && (
            <div className="mt-0.5 text-[9px] leading-tight text-muted-foreground/80 italic line-clamp-2">
              {currencyNote}
            </div>
          )}
        </div>

        {/* Action row — its own line, evenly spaced from the price above. */}
        <div className="flex items-center justify-between gap-2">
          {!game.isFreeToPlay ? <PriceAlertButton game={game} /> : <span />}
          <a
            href={game.bestDeal.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleBuy}
            className={`sound-tap inline-flex items-center gap-1 rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold shadow-md transition-all hover:brightness-110 hover:shadow-[var(--shadow-glow)] active:scale-95 ${
              game.isFreeToPlay
                ? "bg-accent text-accent-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {game.isFreeToPlay ? (
              <>
                {t("getFree")} <Play className="h-3 w-3" />
              </>
            ) : (
              <>
                {t("buy")} <ExternalLink className="h-3 w-3" />
              </>
            )}
          </a>
        </div>

        {/* Minimum PC system requirements */}
        {reqs && (
          <div className="rounded-lg border border-border/60 bg-secondary/30">
            <button
              onClick={() => setShowReqs((s) => !s)}
              className="sound-tap flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-[10px] sm:text-xs font-semibold text-foreground/90"
            >
              <span className="inline-flex items-center gap-1.5">
                <MonitorCog className="h-3.5 w-3.5 text-primary" />
                {isRTL ? "الحد الأدنى لمواصفات التشغيل" : "Min PC Requirements"}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showReqs ? "rotate-180" : ""}`} />
            </button>
            {showReqs && (
              <div className="space-y-1.5 border-t border-border/60 px-2.5 py-2 text-[10px] sm:text-xs text-muted-foreground">
                <div className="flex items-start gap-1.5">
                  <MemoryStick className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                  <span><span className="font-semibold text-foreground">RAM:</span> {reqs.ram}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <MonitorCog className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                  <span><span className="font-semibold text-foreground">{isRTL ? "كرت الشاشة" : "GPU"}:</span> {reqs.gpu}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Cpu className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                  <span><span className="font-semibold text-foreground">{isRTL ? "المعالج" : "CPU"}:</span> {reqs.cpu}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
