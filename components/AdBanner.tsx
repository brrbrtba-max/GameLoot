import { Megaphone } from "lucide-react";

// Clean, responsive ad banner placeholder. Used to fill empty space on the
// search / catalog results screen. Purely a mockup — no real ad network.
export function AdBanner({ label = "Advertisement" }: { label?: string }) {
  return (
    <div
      className="relative flex items-center justify-between gap-4 overflow-hidden rounded-xl border border-dashed border-primary/30 bg-card/40 px-5 py-6 text-left"
      style={{
        backgroundImage:
          "radial-gradient(circle at 15% 50%, oklch(0.78 0.19 145 / 0.12), transparent 40%), radial-gradient(circle at 85% 50%, oklch(0.7 0.18 280 / 0.12), transparent 40%)",
      }}
    >
      <span className="absolute right-3 top-2 rounded bg-background/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
        Ad
      </span>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
          <Megaphone className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-bold text-foreground">Your banner could be here</div>
          <div className="text-xs text-muted-foreground">{label} · responsive 728×90 / 320×50 placeholder</div>
        </div>
      </div>
    </div>
  );
}
