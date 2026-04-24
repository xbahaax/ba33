import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
} from "@ba33/ui-web";

type ItemTone = "default" | "muted" | "success" | "warning" | "destructive";

interface InfoListItem {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  tone?: ItemTone;
}

interface InfoListCardProps {
  title: string;
  description?: string;
  items: InfoListItem[];
  emptyMessage?: string;
  className?: string;
}

const toneClasses: Record<ItemTone, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  success: "text-success",
  warning: "text-warning-dark",
  destructive: "text-destructive",
};

export function InfoListCard({
  title,
  description,
  items,
  emptyMessage = "Aucune donnée disponible.",
  className,
}: InfoListCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="flex min-h-52 items-center justify-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border/80 bg-background/80 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{item.label}</p>
                  {item.helper ? (
                    <p className="text-xs text-muted-foreground">{item.helper}</p>
                  ) : null}
                </div>
                <div
                  className={cn(
                    "text-right font-mono text-sm font-semibold",
                    toneClasses[item.tone ?? "default"],
                  )}
                >
                  {item.value}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
