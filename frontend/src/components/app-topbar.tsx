import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/session";

const TITLES: Record<string, string> = {
  "/dashboard/employee": "Employee dashboard",
  "/dashboard/team-lead": "Team-lead dashboard",
  "/dashboard/management": "Management dashboard",
  "/dashboard/financial": "Financial dashboard",
  "/availability": "Availability",
  "/tasks": "Tasks",
  "/tasks/new": "New task",
  "/review": "Review queue",
  "/disputes": "Disputes",
  "/profile": "Profile",
  "/admin/users": "Users",
  "/admin/roles": "Roles & permissions",
  "/admin/platforms": "Platforms & rates",
  "/admin/projects": "Projects",
  "/admin/rejection-categories": "Rejection categories",
};

function titleFor(path: string) {
  if (TITLES[path]) return TITLES[path];
  const match = Object.keys(TITLES).find((p) => path.startsWith(p));
  return match ? TITLES[match] : "";
}

export function AppTopBar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { session } = useSession();
  const dashboards = session?.dashboards ?? [];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <SidebarTrigger className="ml-0" />
      <div className="hidden flex-col leading-tight sm:flex">
        <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">MENAOS</span>
        <h1 className="text-sm font-semibold">{titleFor(path) || "Overview"}</h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {dashboards.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                Switch dashboard
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider">
                Your dashboards
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {dashboards.map((d) => (
                <DropdownMenuItem key={d.id} asChild>
                  <Link to={d.path}>{d.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
