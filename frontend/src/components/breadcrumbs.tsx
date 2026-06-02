import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const segments = path.split("/").filter(Boolean);
  if (!segments.length) return null;

  let acc = "";
  return (
    <nav aria-label="Breadcrumb" className="border-b bg-surface/40 px-6 py-2 text-xs">
      <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        <li>
          <Link to="/" className="inline-flex items-center gap-1 hover:text-foreground">
            <Home className="size-3" />
          </Link>
        </li>
        {segments.map((s, i) => {
          acc += `/${s}`;
          const label = s.replace(/-/g, " ");
          const isLast = i === segments.length - 1;
          return (
            <li key={acc} className="flex items-center gap-1.5">
              <ChevronRight className="size-3" />
              {isLast ? (
                <span className="font-medium capitalize text-foreground">{label}</span>
              ) : (
                <Link to={acc} className="capitalize hover:text-foreground">{label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
