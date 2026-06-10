import { useMemo } from "react";
import { ExternalLink, Gift, CalendarClock, Radio } from "lucide-react";
import { nextThursday, useCountdown, useLiveTick, seededRandom } from "@/lib/live";
import { useSettings } from "@/context/SettingsContext";

interface EpicDeal {
  id: string;
  title: string;
  vendor: string;
  imageUrl: string;
}

const EPIC_THURSDAY: EpicDeal[] = [
  {
    id: "epic_t1",
    title: "Prey",
    vendor: "Epic Games Store",
    imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/480490/header.jpg",
  },
  {
    id: "epic_t2",
    title: "Jotun: Valhalla Edition",
    vendor: "Epic Games Store",
    imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/372800/header.jpg",
  },
];

function CountdownPill({ endsAt }: { endsAt: Date }) {
  const { isRTL } = useSettings();
  const c = useCountdown(endsAt);
  if (!c) return <span className="text-xs font-bold text-destructive">{isRTL ? "انتهى العرض" : "Offer Expired"}</span>;
  return (
    <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-accent">
      <CalendarClock className="h-3.5 w-3.5" />
      {c.days}d {String(c.hours).padStart(2, "0")}h {String(c.minutes).padStart(2, "0")}m{" "}
      {String(c.seconds).padStart(2, "0")}s
    </div>
  );
}

export function EpicThursdayDeals() {
  const { isRTL } = useSettings();
  const { tick } = useLiveTick();

  // Always points at the upcoming Thursday cutoff so the timer is never stale.
  const endsAt = useMemo(() => nextThursday(), []);

  // Rotate "claimed today" social-proof counters each tick for a live feel.
  const claims = useMemo(
    () =>
      Object.fromEntries(
        EPIC_THURSDAY.map((g) => [g.id, 4200 + Math.floor(seededRandom(g.id, tick) * 5800)]),
      ),
    [tick],
  );

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent ring-1 ring-accent/30">
          <Gift className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            {isRTL ? "مجانيات الخميس من Epic" : "Epic Thursday Freebies"}
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive ring-1 ring-destructive/30">
              <Radio className="h-3 w-3 animate-pulse" /> Live
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? "ألعاب مجانية كل أسبوع على Epic — اغتنمها قبل انتهاء المؤقت."
              : "Free every week on Epic Games Store — grab them before the timer runs out."}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {EPIC_THURSDAY.map((g) => (
          <article
            key={g.id}
            className="group relative overflow-hidden rounded-xl border border-accent/30 bg-card shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-accent/60"
            style={{ boxShadow: "0 0 30px oklch(0.78 0.19 145 / 0.15)" }}
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-muted">
              <img
                src={g.imageUrl}
                alt={g.title}
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute left-3 top-3 rounded-md bg-accent px-2 py-1 text-xs font-bold text-accent-foreground shadow-lg">
                EPIC THURSDAY · FREE
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 p-4">
              <div>
                <h3 className="text-base font-bold text-foreground">{g.title}</h3>
                <div className="mt-1">
                  <CountdownPill endsAt={endsAt} />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {isRTL
                    ? `${claims[g.id].toLocaleString()} لاعب حصلوا عليها اليوم`
                    : `${claims[g.id].toLocaleString()} players claimed today`}
                </p>
              </div>
              <a
                href="https://store.epicgames.com/en-US/free-games"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground shadow-md transition-all hover:-translate-y-0.5 hover:brightness-110 active:scale-95"
              >
                {isRTL ? "احصل مجاناً" : "Get Free"} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
