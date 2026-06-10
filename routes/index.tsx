import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameCatalog } from "@/components/GameCatalog";
import { FreeGamesHub } from "@/components/FreeGamesHub";
import { PrimeBanner } from "@/components/PrimeBanner";
import { LiveSearch } from "@/components/LiveSearch";
import { EpicThursdayDeals } from "@/components/EpicThursdayDeals";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { AppOpenAd } from "@/components/AppOpenAd";
import { Sparkles } from "lucide-react";

// @ts-ignore - AdMob global is injected by the native mobile shell at runtime
// (kept declared so mobile builds don't trip on missing type annotations).
declare const admob: any;

// Fully decoupled, guarded AdMob bootstrap. Wrapped in @ts-ignore + a runtime
// guard so standard web/SSR builds never trip on the missing native global.
function initializeAdMob() {
  try {
    // @ts-ignore - `admob` only exists inside the native mobile WebView shell.
    if (typeof admob !== "undefined" && admob?.start) {
      // @ts-ignore - native bridge call, no web-side types.
      admob.start();
    }
  } catch {
    // No-op on web: AdMob is a native-only capability.
  }
}

function Index() {
  useEffect(() => {
    initializeAdMob();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppOpenAd />
      <SiteHeader />

      {/* Hero — compact & sleek so game content sits higher up */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, oklch(0.78 0.19 145 / 0.5), transparent 50%), radial-gradient(circle at 80% 60%, oklch(0.7 0.18 250 / 0.4), transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 py-6 md:py-8 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/50 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground mb-2.5">
              <Sparkles className="h-2.5 w-2.5 text-primary" /> Live prices · 50+ stores tracked
            </div>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight leading-tight">
              Never overpay for a great game again.
            </h1>
            <p className="mt-1.5 text-xs md:text-sm text-muted-foreground max-w-xl">
              GameLoot instantly compares the best prices across Steam, Epic, GOG, PlayStation, Xbox & Nintendo eShop.
            </p>
          </div>
        </div>
      </section>

      <LiveSearch />

      <EpicThursdayDeals />

      <div id="deals" />
      <GameCatalog />

      <PrimeBanner />

      <FreeGamesHub />

      <SiteFooter />
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "GameLoot — Compare Game Prices Across Every Store" },
      {
        name: "description",
        content:
          "Find the best deals on PC, PlayStation, Xbox and Switch games. GameLoot compares Steam, Epic, GOG, Humble and more in real time.",
      },
    ],
  }),
});

