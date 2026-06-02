import { cn } from "@/lib/utils";

interface BrandMarkProps {
  collapsed?: boolean;
  className?: string;
}

export function BrandMark({ collapsed, className }: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm"
      >
        <span className="font-mono text-sm font-bold">M</span>
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <div className="font-mono text-sm font-bold tracking-tight">MENAOS</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Data Ops
          </div>
        </div>
      )}
    </div>
  );
}
