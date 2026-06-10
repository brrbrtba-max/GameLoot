import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettings } from "@/context/SettingsContext";

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead, t } = useSettings();
  return (
    <DropdownMenu onOpenChange={(o) => o && markAllRead()}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={t("notifications")}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/60 text-foreground hover:bg-secondary transition"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground ring-2 ring-background">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="font-bold text-sm text-foreground">{t("notifications")}</div>
          <button onClick={markAllRead} className="text-[11px] font-medium text-primary hover:underline">
            {t("markAllRead")}
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto divide-y divide-border">
          {notifications.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">{t("noNotifications")}</div>
          )}
          {notifications.map((n) => (
            <div key={n.id} className="px-4 py-3 hover:bg-secondary/40 transition">
              <div className="flex items-start gap-2">
                <span
                  className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                    n.kind === "alert" ? "bg-accent" : "bg-primary"
                  } ${!n.unread ? "opacity-30" : ""}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`text-sm font-bold ${n.kind === "alert" ? "text-accent" : "text-foreground"}`}>
                      {n.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground shrink-0">{n.time}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
