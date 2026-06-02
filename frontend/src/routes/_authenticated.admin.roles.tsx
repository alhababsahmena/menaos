import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { rolesApi } from "@/services/api";
import type { Permission, PermissionKey } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/roles")({
  component: RolesAdminPage,
});

function RolesAdminPage() {
  const { data: roles = [] } = useQuery({ queryKey: ["roles"], queryFn: () => rolesApi.list() });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const role = roles.find((r) => r.id === selectedId) ?? roles[0];

  return (
    <PageBody>
      <PageHeader title="Roles & permissions" description="Permissions are data — change a role's matrix and the sidebar updates for every user with that role." />
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <Card className="border">
          <CardContent className="p-2">
            <ul className="space-y-1">
              {roles.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    className={`flex w-full items-start justify-between rounded-md px-3 py-2 text-left transition ${
                      role?.id === r.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-medium">{r.name}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1">{r.description}</div>
                    </div>
                    {r.is_system && <span className="text-[10px] text-muted-foreground">system</span>}
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        {role && <RoleEditor roleId={role.id} />}
      </div>
    </PageBody>
  );
}

function RoleEditor({ roleId }: { roleId: string }) {
  const qc = useQueryClient();
  const { data: perms = [] } = useQuery({ queryKey: ["permissions"], queryFn: () => rolesApi.listPermissions() });
  const { data: dashboards = [] } = useQuery({ queryKey: ["dashboards"], queryFn: () => rolesApi.listDashboards() });
  const { data: rolePerms = [] } = useQuery({ queryKey: ["roles", roleId, "perms"], queryFn: () => rolesApi.permissionsFor(roleId) });
  const { data: roleDash = [] } = useQuery({ queryKey: ["roles", roleId, "dash"], queryFn: () => rolesApi.dashboardsFor(roleId) });

  const [working, setWorking] = useState<Set<PermissionKey> | null>(null);
  const [workingDash, setWorkingDash] = useState<Set<string> | null>(null);
  const active = working ?? new Set(rolePerms);
  const activeDash = workingDash ?? new Set(roleDash);

  const grouped = useMemo(() => {
    const m = new Map<string, Permission[]>();
    for (const p of perms) {
      const arr = m.get(p.group) ?? [];
      arr.push(p);
      m.set(p.group, arr);
    }
    return [...m.entries()];
  }, [perms]);

  const save = useMutation({
    mutationFn: async () => {
      await rolesApi.setPermissions(roleId, [...active]);
      await rolesApi.setDashboards(roleId, [...activeDash]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles", roleId] });
      qc.invalidateQueries({ queryKey: ["session"] });
      setWorking(null); setWorkingDash(null);
      toast.success("Role saved");
    },
  });

  const toggle = (k: PermissionKey) => {
    const next = new Set(active);
    if (next.has(k)) next.delete(k); else next.add(k);
    setWorking(next);
  };
  const toggleDash = (id: string) => {
    const next = new Set(activeDash);
    if (next.has(id)) next.delete(id); else next.add(id);
    setWorkingDash(next);
  };

  const dirty = working != null || workingDash != null;

  return (
    <div className="space-y-4">
      <Card className="border">
        <CardHeader>
          <CardTitle className="text-sm">Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {grouped.map(([group, list]) => (
            <div key={group}>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{group}</div>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {list.map((p) => (
                  <label key={p.key} className="flex cursor-pointer items-start gap-2 rounded-md border p-2 hover:bg-accent/30">
                    <Checkbox checked={active.has(p.key)} onCheckedChange={() => toggle(p.key)} className="mt-0.5" />
                    <div className="leading-tight">
                      <div className="text-sm">{p.label}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{p.key}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border">
        <CardHeader><CardTitle className="text-sm">Dashboard access</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {dashboards.map((d) => (
              <label key={d.id} className="flex cursor-pointer items-center gap-2 rounded-md border p-2 hover:bg-accent/30">
                <Checkbox checked={activeDash.has(d.id)} onCheckedChange={() => toggleDash(d.id)} />
                <div className="leading-tight">
                  <div className="text-sm">{d.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{d.path}</div>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 flex items-center justify-end gap-2 rounded-md border bg-background/90 p-3 shadow-sm backdrop-blur">
        <Button variant="ghost" onClick={() => { setWorking(null); setWorkingDash(null); }} disabled={!dirty}>Discard</Button>
        <Button onClick={() => save.mutate()} disabled={!dirty || save.isPending}>{save.isPending ? "Saving…" : "Save changes"}</Button>
      </div>
    </div>
  );
}
