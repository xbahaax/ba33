"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Package, Truck, ShieldCheck, AlertCircle, X } from "lucide-react";
import { cn } from "@ba33/ui-web/cn";

type NotificationType = "order" | "delivery" | "certificate" | "complaint";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
};

const initialNotifications: Notification[] = [
  {
    id: "n1",
    type: "delivery",
    title: "Expédition en route",
    description: "Commande #CMD-20240312 expédiée — arrivée estimée 26 Avr",
    time: "Il y a 10 min",
    read: false,
  },
  {
    id: "n2",
    type: "certificate",
    title: "Nouveau certificat NFN",
    description: "Le produit P1-00042 vient d'être certifié NFN Grade A",
    time: "Il y a 1h",
    read: false,
  },
  {
    id: "n3",
    type: "order",
    title: "Commande confirmée",
    description: "Commande #CMD-20240311 confirmée par le vendeur",
    time: "Il y a 3h",
    read: false,
  },
  {
    id: "n4",
    type: "complaint",
    title: "Réclamation traitée",
    description: "Votre réclamation #REC-2024-01 a été résolue",
    time: "Hier",
    read: true,
  },
];

const typeIcon: Record<NotificationType, React.ElementType> = {
  order: Package,
  delivery: Truck,
  certificate: ShieldCheck,
  complaint: AlertCircle,
};

const typeColors: Record<NotificationType, string> = {
  order: "bg-chart-2/15 text-chart-2",
  delivery: "bg-chart-4/15 text-chart-4",
  certificate: "bg-chart-1/15 text-chart-1",
  complaint: "bg-destructive/15 text-destructive",
};

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        type="button"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ""}`}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
          open && "bg-accent text-accent-foreground"
        )}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse-dot">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="animate-scale-in absolute right-0 top-12 z-50 w-96 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm text-foreground">Notifications</p>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tout marquer lu
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <Bell className="h-8 w-8 opacity-30" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = typeIcon[notification.type];
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "group relative flex items-start gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-accent/40",
                      !notification.read && "bg-primary/[0.03]"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", typeColors[notification.type])}>
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm", !notification.read ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                          {notification.title}
                        </p>
                        <button
                          type="button"
                          onClick={() => dismiss(notification.id)}
                          className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
                          aria-label="Supprimer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                        {notification.description}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground/70">
                        {notification.time}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!notification.read && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-border px-4 py-2.5">
              <button type="button" className="w-full text-center text-xs text-muted-foreground transition-colors hover:text-primary">
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
