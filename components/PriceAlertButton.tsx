import { useState } from "react";
import { Bell, BellRing, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSettings, CURRENCY_INFO } from "@/context/SettingsContext";
import type { Game } from "@/data/games";
import { toast } from "sonner";

export function PriceAlertButton({ game }: { game: Game }) {
  const { t, currency, formatPrice, toUsd, addAlert, removeAlert, getAlert } = useSettings();
  const existing = getAlert(game.id);
  const currentLocal = +(game.bestDeal.price * CURRENCY_INFO[currency].rate).toFixed(2);
  const defaultTarget = (currentLocal * 0.8).toFixed(2);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>(
    existing
      ? (existing.targetUsd * CURRENCY_INFO[currency].rate).toFixed(2)
      : defaultTarget,
  );

  const symbol = CURRENCY_INFO[currency].symbol;

  function save() {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      toast.error("Enter a valid target price");
      return;
    }
    addAlert({
      gameId: game.id,
      gameTitle: game.title,
      targetUsd: toUsd(num),
      currentUsd: game.bestDeal.price,
    });
    toast.success(`Alert set for ${game.title} at ${formatPrice(toUsd(num))}`);
    setOpen(false);
  }

  function clear() {
    removeAlert(game.id);
    toast(`Alert removed for ${game.title}`);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label={t("notifyMe")}
          title={existing ? t("activeAlert") : t("notifyMe")}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition shrink-0 ${
            existing
              ? "border-accent/60 bg-accent/15 text-accent hover:bg-accent/25"
              : "border-border bg-secondary/60 text-foreground hover:bg-secondary"
          }`}
        >
          {existing ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-accent" /> {t("setAlert")}
          </DialogTitle>
          <DialogDescription>{t("alertDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-border bg-secondary/40 p-3 flex items-center gap-3">
            <div className="h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0">
              {game.image && <img src={game.image} alt={game.title} className="w-full h-full object-cover" />}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm truncate">{game.title}</div>
              <div className="text-xs text-muted-foreground">
                {t("currentPrice")}:{" "}
                <span className="font-semibold text-foreground">{formatPrice(game.bestDeal.price)}</span>
              </div>
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("targetPrice")}
            </span>
            <div className="mt-1.5 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                {symbol}
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-lg border border-border bg-input/50 pl-9 pr-3 py-2.5 text-base font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </label>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          {existing ? (
            <button
              onClick={clear}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground hover:bg-destructive/10 hover:text-destructive transition"
            >
              <X className="h-4 w-4" /> {t("removeAlert")}
            </button>
          ) : <span />}
          <button
            onClick={save}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-md hover:brightness-110 transition"
          >
            <BellRing className="h-4 w-4" /> {t("saveAlert")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
