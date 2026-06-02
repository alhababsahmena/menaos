import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/data-table";
import { UserAvatar } from "@/components/user-avatar";
import { rolesApi, usersApi } from "@/services/api";
import { formatDate, fullName } from "@/lib/format";
import type { ColumnDef } from "@tanstack/react-table";
import type { Role, User } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersAdminPage,
});

function UsersAdminPage() {
  const qc = useQueryClient();
  const { data: users = [], isLoading } = useQuery({ queryKey: ["users"], queryFn: () => usersApi.list() });
  const { data: roles = [] } = useQuery({ queryKey: ["roles"], queryFn: () => rolesApi.list() });

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => usersApi.setActive(id, active),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("User updated"); },
  });

  const cols: ColumnDef<User>[] = [
    { id: "user", header: "User", cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <UserAvatar name={fullName(row.original)} photoUrl={row.original.photo_url} size="sm" />
        <div className="leading-tight">
          <div className="text-sm font-medium">{fullName(row.original)}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      </div>
    )},
    { id: "roles", header: "Roles", cell: ({ row }) => <UserRoles userId={row.original.id} allRoles={roles} /> },
    { accessorKey: "created_at", header: "Created", cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.created_at)}</span> },
    { id: "active", header: "Active", cell: ({ row }) => (
      <Switch checked={row.original.is_active} onCheckedChange={(v) => toggleActive.mutate({ id: row.original.id, active: v })} />
    )},
  ];

  return (
    <PageBody>
      <PageHeader
        title="Users"
        description="Soft-deactivation revokes access immediately. Roles are tracked with assignment history."
        actions={<CreateUserButton onCreated={() => qc.invalidateQueries({ queryKey: ["users"] })} roles={roles} />}
      />
      <Card className="border"><CardContent className="p-0"><DataTable columns={cols} data={users} isLoading={isLoading} /></CardContent></Card>
    </PageBody>
  );
}

function UserRoles({ userId, allRoles }: { userId: string; allRoles: Role[] }) {
  const qc = useQueryClient();
  const { data: roles = [] } = useQuery({ queryKey: ["users", userId, "roles"], queryFn: () => usersApi.rolesFor(userId) });
  const assigned = new Set(roles.map((r) => r.id));
  const toggle = useMutation({
    mutationFn: async ({ roleId, on }: { roleId: string; on: boolean }) => {
      if (on) await usersApi.assignRole(userId, roleId);
      else await usersApi.unassignRole(userId, roleId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users", userId, "roles"] }),
  });
  return (
    <div className="flex flex-wrap gap-1.5">
      {allRoles.map((r) => {
        const on = assigned.has(r.id);
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => toggle.mutate({ roleId: r.id, on: !on })}
            className={`rounded-full px-2 py-0.5 text-[11px] ring-1 transition ${
              on ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-muted-foreground ring-border hover:bg-accent"
            }`}
          >
            {r.name}
          </button>
        );
      })}
    </div>
  );
}

function CreateUserButton({ onCreated, roles }: { onCreated: () => void; roles: Role[] }) {
  const [open, setOpen] = useState(false);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState<string>("");

  const m = useMutation({
    mutationFn: async () => {
      const u = await usersApi.create({
        entra_object_id: `entra-${Math.random().toString(36).slice(2, 10)}`,
        email, first_name: first, last_name: last, photo_url: null, is_active: true,
      });
      if (roleId) await usersApi.assignRole(u.id, roleId);
      return u;
    },
    onSuccess: () => { toast.success("User created"); setOpen(false); setFirst(""); setLast(""); setEmail(""); setRoleId(""); onCreated(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="size-3.5" /> New user</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create user</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>First name</Label><Input value={first} onChange={(e) => setFirst(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Last name</Label><Input value={last} onChange={(e) => setLast(e.target.value)} /></div>
          </div>
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-1.5">
            <Label>Initial role</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger><SelectValue placeholder="(none)" /></SelectTrigger>
              <SelectContent>
                {roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => m.mutate()} disabled={!first || !last || !email || m.isPending}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
