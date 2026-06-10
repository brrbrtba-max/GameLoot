import { createFileRoute, Link } from "@tanstack/react-router";
import { useSettings } from "@/context/SettingsContext";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { toast } from "sonner";
import {
  Crown,
  Wallet,
  Bell,
  Heart,
  History,
  Settings,
  Languages,
  Link2,
  LifeBuoy,
  Info,
  ChevronRight,
  ChevronLeft,
  LogOut,
  User,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "My Profile — GameLoot" },
      { name: "description", content: "Manage your GameLoot account: wallet savings, price alerts, favorite games, settings, linked stores and support." },
      { property: "og:title", content: "My Profile — GameLoot" },
      { property: "og:description", content: "Your GameLoot account hub — wallet, activity, settings and support." },
    ],
  }),
});

interface Row {
  icon: LucideIcon;
  label: string;
  value?: string;
}

function ProfilePage() {
  const { isRTL, isPrime, alerts, t } = useSettings();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const tr = (en: string, ar: string) => (isRTL ? ar : en);

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: tr("My Wallet", "محفظتي"),
      rows: [
        { icon: Wallet, label: tr("Total Saved", "إجمالي التوفير"), value: "$1,265.70" },
      ],
    },
    {
      title: tr("My Activity", "نشاطي"),
      rows: [
        { icon: Bell, label: tr("Price Alerts Set", "تنبيهات الأسعار"), value: String(alerts.length) },
        { icon: Heart, label: tr("Favorite Games", "الألعاب المفضلة"), value: "12" },
        { icon: History, label: tr("Recent Searches", "عمليات البحث الأخيرة"), value: "8" },
      ],
    },
    {
      title: tr("App Settings", "إعدادات التطبيق"),
      rows: [
        { icon: Bell, label: tr("Notification Preferences", "تفضيلات الإشعارات") },
        { icon: Languages, label: tr("Language", "اللغة") },
        { icon: Link2, label: tr("Linked Stores (Steam/Epic)", "المتاجر المرتبطة (Steam/Epic)") },
      ],
    },
    {
      title: tr("Support", "الدعم"),
      rows: [
        { icon: LifeBuoy, label: tr("Help Center", "مركز المساعدة") },
        { icon: Info, label: tr("About GameLoot", "عن GameLoot") },
      ],
    },
  ];

  const handleLogout = () => {
    toast.success(tr("Logged out", "تم تسجيل الخروج"), {
      description: tr("You've been signed out of GameLoot.", "تم تسجيل خروجك من GameLoot."),
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* Profile header */}
        <section className="relative overflow-hidden rounded-2xl border border-primary/30 p-5 mb-6"
          style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 12% 20%, oklch(0.78 0.19 145 / 0.35), transparent 45%), radial-gradient(circle at 88% 80%, oklch(0.7 0.18 250 / 0.4), transparent 45%)",
            }}
          />
          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--gradient-hero)] shadow-[var(--shadow-glow)]">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold tracking-tight truncate">ProGamer_2026</h1>
              <p className="text-xs text-muted-foreground truncate">player@gameloot.gg</p>
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                <Crown className="h-3.5 w-3.5" />
                {isPrime ? t("primeMember") : tr("Free Member", "عضو مجاني")}
              </span>
            </div>
          </div>
        </section>

        {/* Trendyol-style list categories */}
        <div className="space-y-5">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h2>
              <div className="overflow-hidden rounded-xl border border-border bg-card divide-y divide-border">
                {section.rows.map((row) => (
                  <button
                    key={row.label}
                    className="sound-tap flex w-full items-center gap-3 px-4 py-3.5 text-start transition-colors hover:bg-secondary/40"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                      <row.icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-sm font-medium text-foreground">{row.label}</span>
                    {row.value && (
                      <span className="text-sm font-bold text-primary">{row.value}</span>
                    )}
                    <Chevron className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Settings shortcut + Logout */}
        <div className="mt-6 space-y-3">
          <Link
            to="/"
            className="sound-tap flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary/40"
          >
            <Settings className="h-4 w-4" />
            {tr("Back to GameLoot", "العودة إلى GameLoot")}
          </Link>
          <button
            onClick={handleLogout}
            className="sound-tap flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive transition hover:bg-destructive/20 active:scale-[0.99]"
          >
            <LogOut className="h-4 w-4" />
            {tr("Log Out", "تسجيل الخروج")}
          </button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
