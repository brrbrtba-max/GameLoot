import { Link } from "@tanstack/react-router";
import { Home, Library, Gift, User } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

/**
 * Fixed mobile bottom navigation bar with glowing neon icons.
 * Hidden on md+ where the top header nav is visible.
 */
export function BottomNav() {
  const { t } = useSettings();

  const items = [
    { to: "/", label: t("home"), icon: Home, hash: undefined as string | undefined, activeOptions: { exact: true, includeHash: true } },
    { to: "/catalog", label: t("catalog"), icon: Library, hash: undefined as string | undefined, activeOptions: { exact: false } },
    { to: "/", label: t("free"), icon: Gift, hash: "free" as string | undefined, activeOptions: { exact: true, includeHash: true } },
    { to: "/profile", label: t("profile"), icon: User, hash: undefined as string | undefined, activeOptions: { exact: false } },
  ];

  return (
    <>
      {/* Spacer so fixed bar never covers page footer content on mobile */}
      <div className="h-16 md:hidden" aria-hidden />
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-border bg-background/90 backdrop-blur-lg">
        <ul className="grid grid-cols-4">
          {items.map(({ to, label, icon: Icon, hash, activeOptions }) => (
            <li key={label}>
              <Link
                to={to}
                hash={hash}
                activeOptions={activeOptions}
                className="sound-tap group flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium text-muted-foreground transition-colors"
                activeProps={{ className: "text-primary" }}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl transition-all group-data-[status=active]:bg-primary/15 group-data-[status=active]:shadow-[0_0_16px_-2px_var(--color-primary)] group-data-[status=active]:ring-1 group-data-[status=active]:ring-primary/50">
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
