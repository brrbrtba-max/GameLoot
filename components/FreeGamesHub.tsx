import { useMemo } from "react";
import { Gift, Sparkles, Timer, BadgeCheck, Gamepad2 } from "lucide-react";
import { GAMES, type Game } from "@/data/games";
import { GameCard } from "./GameCard";
import { useSettings } from "@/context/SettingsContext";
import { nextThursday, useCountdown, useLiveTick, seededRandom } from "@/lib/live";

type StoreKey = "Epic Games Store" | "Steam" | "GOG" | "Ubisoft Store" | "Prime Gaming";

interface FreebieSeed {
  id: string;
  title: string;
  store: StoreKey;
  genre: string;
  image: string;
  retailPrice: number;
  url: string;
}

// Curated "just became free" limited-time giveaways. Retail price is shown
// struck-through next to a bold FREE label + a 100% OFF ribbon.
const LIMITED_FREEBIES: FreebieSeed[] = [
  {
    id: "free-fallout",
    title: "Fallout 4",
    store: "Steam",
    genre: "RPG",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/377160/header.jpg",
    retailPrice: 19.99,
    url: "https://store.steampowered.com/app/377160/",
  },
  {
    id: "free-witcher",
    title: "The Witcher 3: Wild Hunt",
    store: "GOG",
    genre: "RPG",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg",
    retailPrice: 39.99,
    url: "https://www.gog.com/game/the_witcher_3_wild_hunt",
  },
  {
    id: "free-metro",
    title: "Metro Exodus",
    store: "Epic Games Store",
    genre: "FPS",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/412020/header.jpg",
    retailPrice: 39.99,
    url: "https://store.epicgames.com/en-US/p/metro-exodus",
  },
  {
    id: "free-dead-space",
    title: "Dead Space",
    store: "Prime Gaming",
    genre: "Survival Horror",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1693980/header.jpg",
    retailPrice: 59.99,
    url: "https://gaming.amazon.com/",
  },
  {
    id: "free-ac-odyssey",
    title: "Assassin's Creed Odyssey",
    store: "Ubisoft Store",
    genre: "Action-RPG",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/812140/header.jpg",
    retailPrice: 49.99,
    url: "https://store.ubi.com/",
  },
];

// Brand accents for store-origin badges. Brand identifiers, kept inline.
const STORE_STYLE: Record<StoreKey, { label: string; bg: string; fg: string }> = {
  "Epic Games Store": { label: "Epic", bg: "oklch(0.28 0.02 270)", fg: "oklch(0.98 0.005 250)" },
  Steam: { label: "Steam", bg: "oklch(0.45 0.09 250)", fg: "oklch(0.98 0.005 250)" },
  GOG: { label: "GOG", bg: "oklch(0.5 0.2 300)", fg: "oklch(0.98 0.005 250)" },
  "Ubisoft Store": { label: "Ubisoft", bg: "oklch(0.55 0.13 235)", fg: "oklch(0.98 0.005 250)" },
  "Prime Gaming": { label: "Prime", bg: "oklch(0.6 0.16 200)", fg: "oklch(0.14 0.02 250)" },
};

function CountdownTag({ target }: { target: Date }) {
  const { isRTL } = useSettings();
  const c = useCountdown(target);
  if (!c) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-destructive">
        <Timer className="h-3.5 w-3.5" /> {isRTL ? "انتهى العرض" : "Offer Ended"}
      </span>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-2.5 py-1 text-[11px] font-mono font-bold text-destructive ring-1 ring-destructive/30">
      <Timer className="h-3.5 w-3.5 animate-pulse" />
      <span>
        {c.days}d {String(c.hours).padStart(2, "0")}:{String(c.minutes).padStart(2, "0")}:
        {String(c.seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

function FreebieCard({ seed, endsAt, urgent }: { seed: FreebieSeed; endsAt: Date; urgent: boolean }) {
  const { t, formatPrice, isRTL } = useSettings();
  const store = STORE_STYLE[seed.store];
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-primary/25 bg-[var(--gradient-card)] shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-2 hover:border-primary/70 hover:shadow-[var(--shadow-glow)] animate-fade-up">
      {/* 100% OFF ribbon */}
      <div className="pointer-events-none absolute -left-12 top-5 z-20 -rotate-45">
        <div className="bg-accent px-12 py-1 text-center text-[11px] font-extrabold uppercase tracking-wider text-accent-foreground shadow-lg">
          100% OFF
        </div>
      </div>

      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <img
          src={seed.image}
          alt={seed.title}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />

        {/* Store origin badge */}
        <span
          className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold shadow-md backdrop-blur"
          style={{ backgroundColor: store.bg, color: store.fg }}
        >
          <BadgeCheck className="h-3 w-3" /> {store.label}
        </span>

        {/* Countdown / urgency tag */}
        <div className="absolute bottom-3 left-3">
          {urgent ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground shadow-lg animate-neon-pulse">
              <Sparkles className="h-3.5 w-3.5" /> {isRTL ? "لوقت محدود" : "Limited Time"}
            </span>
          ) : (
            <CountdownTag target={endsAt} />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-1 text-base font-bold text-foreground">{seed.title}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Gamepad2 className="h-3 w-3" /> {seed.genre}
          </p>
        </div>

        {!urgent && (
          <div className="-mt-1">
            <CountdownTag target={endsAt} />
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-accent drop-shadow-[0_0_12px_oklch(0.72_0.21_25/0.5)]">
              {isRTL ? "مجاناً" : "FREE"}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(seed.retailPrice)}
            </span>
          </div>
          <a
            href={seed.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[var(--shadow-glow)] active:scale-95"
          >
            {isRTL ? "احصل عليها الآن" : t("getFree")}
          </a>
        </div>
      </div>
    </article>
  );
}

export function FreeGamesHub() {
  const { isRTL } = useSettings();
  const { tick } = useLiveTick();

  // Stagger the giveaway deadlines so the grid feels live: most end the coming
  // Thursday, a couple flip to an "urgent / limited time" state on each tick.
  const endsAt = useMemo(() => nextThursday(), []);
  const freebies = useMemo(() => {
    return LIMITED_FREEBIES.map((seed) => ({
      seed,
      urgent: seededRandom(seed.id, tick) > 0.72,
    }));
  }, [tick]);

  // Permanent free-to-play titles keep their own grid below.
  const f2p = useMemo<Game[]>(
    () => GAMES.filter((g) => g.isFreeToPlay).sort((a, b) => b.popularity - a.popularity),
    [],
  );

  return (
    <section id="free" className="container mx-auto border-t border-border px-4 py-14">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/20 text-accent ring-1 ring-accent/30">
          <Gift className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            {isRTL ? "أصبحت مجانية الآن!" : "Free Right Now!"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? "ألعاب مدفوعة أصبحت مجانية بالكامل لوقت محدود — احصل عليها قبل انتهاء العرض."
              : "Premium games that just turned 100% free — claim them before the timer runs out."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {freebies.map(({ seed, urgent }) => (
          <FreebieCard key={seed.id} seed={seed} endsAt={endsAt} urgent={urgent} />
        ))}
      </div>

      {f2p.length > 0 && (
        <>
          <div className="mb-6 mt-14 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {isRTL ? "مجانية للأبد" : "Free-to-Play Forever"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isRTL ? "العب بلا أي تكلفة، إلى الأبد." : "Play at zero cost, forever."}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {f2p.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
