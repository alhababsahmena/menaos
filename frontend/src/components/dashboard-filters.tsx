import { useQuery } from "@tanstack/react-query";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { platformsApi, projectsApi, usersApi } from "@/services/api";
import { usePermissions } from "@/lib/permissions";
import { useSession } from "@/lib/session";
import type { DashboardFilterValues } from "@/types";

interface Props {
  value: DashboardFilterValues;
  onChange: (v: DashboardFilterValues) => void;
}

export function DashboardFilters({ value, onChange }: Props) {
  const { session } = useSession();
  const { has } = usePermissions();

  const { data: projects = [] } = useQuery({
    queryKey: ["projects", "scope", session?.user.id, has("tasks.view_all"), has("tasks.view_team")],
    queryFn: async () => {
      if (has("tasks.view_all")) return projectsApi.list();
      if (has("tasks.view_team") || !session) return projectsApi.list();
      return projectsApi.forUser(session.user.id);
    },
  });
  const { data: platforms = [] } = useQuery({ queryKey: ["platforms"], queryFn: () => platformsApi.list() });
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.list(),
    enabled: has("tasks.view_all") || has("tasks.view_team"),
  });

  const set = (patch: Partial<DashboardFilterValues>) => onChange({ ...value, ...patch });
  const hasAny = Object.values(value).some(Boolean);

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2 pr-2 text-xs font-medium text-muted-foreground">
          <Filter className="size-3.5" />
          Filters
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">From</Label>
          <Input
            type="date"
            value={value.from ?? ""}
            onChange={(e) => set({ from: e.target.value || undefined })}
            className="h-8 w-[140px]"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">To</Label>
          <Input
            type="date"
            value={value.to ?? ""}
            onChange={(e) => set({ to: e.target.value || undefined })}
            className="h-8 w-[140px]"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Project</Label>
          <Select value={value.projectId ?? "all"} onValueChange={(v) => set({ projectId: v === "all" ? undefined : v })}>
            <SelectTrigger className="h-8 w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Platform</Label>
          <Select value={value.platformId ?? "all"} onValueChange={(v) => set({ platformId: v === "all" ? undefined : v })}>
            <SelectTrigger className="h-8 w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              {platforms.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name} ({p.currency})</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {users.length > 0 && (
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Employee</Label>
            <Select value={value.employeeId ?? "all"} onValueChange={(v) => set({ employeeId: v === "all" ? undefined : v })}>
              <SelectTrigger className="h-8 w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All employees</SelectItem>
                {users.filter((u) => u.is_active).map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.first_name} {u.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {hasAny && (
          <Button variant="ghost" size="sm" onClick={() => onChange({})} className="ml-auto h-8 gap-1.5 text-xs">
            <X className="size-3.5" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
