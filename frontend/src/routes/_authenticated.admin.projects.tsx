import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { platformsApi, projectsApi, usersApi } from "@/services/api";
import { UserAvatar } from "@/components/user-avatar";
import { fullName } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/projects")({
  component: ProjectsAdminPage,
});

function ProjectsAdminPage() {
  const qc = useQueryClient();
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: () => projectsApi.list() });
  const { data: platforms = [] } = useQuery({ queryKey: ["platforms"], queryFn: () => platformsApi.list() });

  return (
    <PageBody>
      <PageHeader
        title="Projects"
        description="Per-platform projects with active members and an optional review gate."
        actions={<CreateProject platforms={platforms} onCreated={() => qc.invalidateQueries({ queryKey: ["projects"] })} />}
      />
      <div className="space-y-4">
        {projects.map((p) => {
          const platform = platforms.find((x) => x.id === p.platform_id);
          return (
            <Card key={p.id} className="border">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">{p.name}
                    <span className="text-xs font-normal text-muted-foreground">· {platform?.name} ({platform?.currency})</span>
                  </CardTitle>
                  {p.description && <p className="mt-0.5 text-xs text-muted-foreground">{p.description}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <Label className="flex items-center gap-2 text-xs">
                    <Switch
                      checked={p.requires_review}
                      onCheckedChange={(v) => projectsApi.update(p.id, { requires_review: v }).then(() => qc.invalidateQueries({ queryKey: ["projects"] }))}
                    />
                    Requires review
                  </Label>
                </div>
              </CardHeader>
              <CardContent>
                <ProjectMembers projectId={p.id} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageBody>
  );
}

function ProjectMembers({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { data: members = [] } = useQuery({ queryKey: ["projects", projectId, "members"], queryFn: () => projectsApi.members(projectId) });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => usersApi.list() });
  const active = members.filter((m) => m.unassigned_at == null);
  const activeIds = new Set(active.map((m) => m.user_id));
  const candidates = users.filter((u) => u.is_active && !activeIds.has(u.id));
  const [picked, setPicked] = useState<string>("");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {active.length === 0 && <span className="text-xs text-muted-foreground">No active members.</span>}
        {active.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => projectsApi.unassignMember(projectId, m.user_id).then(() => qc.invalidateQueries({ queryKey: ["projects", projectId, "members"] }))}
            className="flex items-center gap-1.5 rounded-full bg-accent px-2 py-1 text-xs text-accent-foreground hover:bg-accent/70"
            title="Remove"
          >
            <UserAvatar name={fullName(m.user)} photoUrl={m.user.photo_url} size="xs" />
            <span>{fullName(m.user)}</span>
            <span className="text-muted-foreground">×</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Select value={picked} onValueChange={setPicked}>
          <SelectTrigger className="h-8 w-[240px]"><SelectValue placeholder="Assign member…" /></SelectTrigger>
          <SelectContent>
            {candidates.map((u) => <SelectItem key={u.id} value={u.id}>{fullName(u)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" disabled={!picked} onClick={async () => { await projectsApi.assignMember(projectId, picked); setPicked(""); qc.invalidateQueries({ queryKey: ["projects", projectId, "members"] }); }}>
          Assign
        </Button>
      </div>
    </div>
  );
}

function CreateProject({ platforms, onCreated }: { platforms: { id: string; name: string; currency: string }[]; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [platformId, setPlatformId] = useState("");
  const [requiresReview, setRequiresReview] = useState(false);
  const m = useMutation({
    mutationFn: () => projectsApi.create({
      name, description, platform_id: platformId,
      started_at: new Date().toISOString(),
      ended_at: null, requires_review: requiresReview, is_active: true,
    }),
    onSuccess: () => { toast.success("Project created"); setOpen(false); setName(""); setDescription(""); setPlatformId(""); onCreated(); },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="size-3.5" /> New project</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New project</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Description</Label><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="space-y-1.5">
            <Label>Platform</Label>
            <Select value={platformId} onValueChange={setPlatformId}>
              <SelectTrigger><SelectValue placeholder="Pick a platform" /></SelectTrigger>
              <SelectContent>
                {platforms.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.currency})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Label className="flex items-center gap-2 text-sm">
            <Switch checked={requiresReview} onCheckedChange={setRequiresReview} />
            Requires team-lead review before platform submission
          </Label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => m.mutate()} disabled={!name || !platformId || m.isPending}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
