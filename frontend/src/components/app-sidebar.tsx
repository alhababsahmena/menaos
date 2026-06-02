import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Calendar,
  ClipboardList,
  FileCheck,
  Gavel,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  Sparkles,
  ShieldCheck,
  Building2,
  Users,
  FolderKanban,
  Tag,
  UserCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { BrandMark } from "@/components/brand-mark";
import { usePermissions } from "@/lib/permissions";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { fullName } from "@/lib/format";
import type { PermissionKey } from "@/types";

interface NavItem {
  title: string;
  to: string;
  icon: LucideIcon;
  permission?: PermissionKey;
  anyOf?: PermissionKey[];
}

const DASH_ITEMS: NavItem[] = [
  { title: "Employee", to: "/dashboard/employee", icon: LayoutDashboard, permission: "dashboard.employee" },
  { title: "Team Lead", to: "/dashboard/team-lead", icon: BarChart3, permission: "dashboard.team_lead" },
  { title: "Management", to: "/dashboard/management", icon: Sparkles, permission: "dashboard.management" },
  { title: "Financial", to: "/dashboard/financial", icon: Building2, permission: "dashboard.financial" },
];

const WORK_ITEMS: NavItem[] = [
  { title: "Availability", to: "/availability", icon: Calendar, permission: "availability.log" },
  { title: "Tasks", to: "/tasks", icon: ClipboardList, anyOf: ["tasks.create", "tasks.view_team", "tasks.view_all"] },
  { title: "Review queue", to: "/review", icon: FileCheck, permission: "tasks.review" },
  { title: "Disputes", to: "/disputes", icon: Gavel, permission: "disputes.view" },
];

const ADMIN_ITEMS: NavItem[] = [
  { title: "Users", to: "/admin/users", icon: Users, permission: "users.manage" },
  { title: "Roles", to: "/admin/roles", icon: ShieldCheck, permission: "roles.manage" },
  { title: "Projects", to: "/admin/projects", icon: FolderKanban, permission: "projects.manage" },
  { title: "Platforms & rates", to: "/admin/platforms", icon: Settings, permission: "platforms.manage" },
  { title: "Rejection categories", to: "/admin/rejection-categories", icon: Tag, permission: "categories.manage" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { has, hasAny } = usePermissions();
  const { session, signOut } = useSession();

  const allowed = (item: NavItem) => (item.permission ? has(item.permission) : item.anyOf ? hasAny(...item.anyOf) : true);
  const visible = (items: NavItem[]) => items.filter(allowed);
  const dash = visible(DASH_ITEMS);
  const work = visible(WORK_ITEMS);
  const admin = visible(ADMIN_ITEMS);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="px-2 py-2"><BrandMark collapsed={collapsed} /></div>
      </SidebarHeader>

      <SidebarContent>
        {dash.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Dashboards</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {dash.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={path.startsWith(item.to)}>
                      <Link to={item.to}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {work.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {work.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={path.startsWith(item.to)}>
                      <Link to={item.to}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {admin.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {admin.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={path.startsWith(item.to)}>
                      <Link to={item.to}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {session && (
          <div className="flex items-center gap-2 p-2">
            <Link to="/profile" className="flex flex-1 items-center gap-2 rounded-md p-1 hover:bg-sidebar-accent">
              <UserAvatar name={fullName(session.user)} photoUrl={session.user.photo_url} size="sm" />
              {!collapsed && (
                <div className="min-w-0 leading-tight">
                  <div className="truncate text-xs font-semibold">{fullName(session.user)}</div>
                  <div className="truncate text-[10px] text-muted-foreground">
                    {session.roles.map((r) => r.name).join(" · ")}
                  </div>
                </div>
              )}
            </Link>
            {!collapsed && (
              <Button variant="ghost" size="icon" aria-label="Sign out" onClick={signOut} className="size-8">
                <LogOut className="size-3.5" />
              </Button>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

export { UserCircle };
