import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: { value: string; direction: "up" | "down" | "flat" };
  className?: string;
}

export function KpiCard({ label, value, hint, icon: Icon, trend, className }: KpiCardProps) {
  return (
    <Card className={cn("border bg-card", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </span>
          {Icon && <Icon className="size-4 text-muted-foreground" />}
        </div>
        <div className="mt-3 font-mono text-2xl font-semibold tabular-nums">{value}</div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          {trend && (
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-medium",
                trend.direction === "up" && "bg-[color:var(--status-accepted)]/15 text-[color:var(--status-accepted)]",
                trend.direction === "down" && "bg-[color:var(--status-rejected)]/15 text-[color:var(--status-rejected)]",
                trend.direction === "flat" && "bg-muted text-muted-foreground",
              )}
            >
              {trend.direction === "up" ? "▲" : trend.direction === "down" ? "▼" : "■"} {trend.value}
            </span>
          )}
          {hint && <span>{hint}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
