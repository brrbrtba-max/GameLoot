import { Settings as SettingsIcon, Check, Globe, Wallet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettings, CURRENCY_INFO, LANGUAGES, type Currency } from "@/context/SettingsContext";

export function SettingsMenu() {
  const { language, setLanguage, currency, setCurrency, t } = useSettings();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={t("settings")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/60 text-foreground hover:bg-secondary transition"
        >
          <SettingsIcon className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 max-h-[70vh] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Globe className="h-3.5 w-3.5" /> {t("language")}
        </DropdownMenuLabel>
        <div className="grid grid-cols-2 gap-1 p-1">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition ${
                language === l.code ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"
              }`}
            >
              <span className="truncate">{l.native}</span>
              {language === l.code && <Check className="h-3.5 w-3.5 shrink-0" />}
            </button>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Wallet className="h-3.5 w-3.5" /> {t("currency")}
        </DropdownMenuLabel>
        <div className="grid grid-cols-2 gap-1 p-1">
          {(Object.keys(CURRENCY_INFO) as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition ${
                currency === c ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"
              }`}
            >
              <span>{c}</span>
              <span className="text-xs opacity-80">{CURRENCY_INFO[c].symbol}</span>
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
