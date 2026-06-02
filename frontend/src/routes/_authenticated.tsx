import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopBar } from "@/components/app-topbar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useSession } from "@/lib/session";
import { usePermissions } from "@/lib/permissions";
import type { PermissionKey } from "@/types";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

// Path-prefix → required permission. If absent, only auth is required.
const ROUTE_PERMISSIONS: { prefix: string; permission: PermissionKey }[] = [
  { prefix: "/dashboard/employee", permission: "dashboard.employee" },
  { prefix: "/dashboard/team-lead", permission: "dashboard.team_lead" },
  { prefix: "/dashboard/management", permission: "dashboard.management" },
  { prefix: "/dashboard/financial", permission: "dashboard.financial" },
  { prefix: "/availability", permission: "availability.log" },
  { prefix: "/review", permission: "tasks.review" },
  { prefix: "/disputes", permission: "disputes.view" },
  { prefix: "/admin/users", permission: "users.manage" },
  { prefix: "/admin/roles", permission: "roles.manage" },
  { prefix: "/admin/projects", permission: "projects.manage" },
  { prefix: "/admin/platforms", permission: "platforms.manage" },
  { prefix: "/admin/rejection-categories", permission: "categories.manage" },
];

function AuthLayout() {
  const { session, isLoading } = useSession();
  const { has } = usePermissions();
  const path = useRouterState({ select: (r) => r.location.pathname });

  if (isLoading) {
    return (
      <div className="grid min-h-dvh place-items-center text-sm text-muted-foreground">
        <div className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Loading…</div>
      </div>
    );
  }
  if (!session) return <Navigate to="/login" />;

  const guard = ROUTE_PERMISSIONS.find((r) => path.startsWith(r.prefix));
  if (guard && !has(guard.permission)) return <Navigate to="/forbidden" />;

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <AppTopBar />
          <Breadcrumbs />
          <main className="flex-1">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
