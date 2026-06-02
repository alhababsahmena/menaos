import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo, useRef } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { platformsApi, projectsApi, tasksApi } from "@/services/api";
import { useRequiredSession } from "@/lib/session";
import { formatMoney } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/tasks/new")({
  component: NewTaskPage,
});

const schema = z.object({
  project_id: z.string().min(1, "Choose a project"),
  external_task_id: z.string().min(1, "Required").max(64),
  description: z.string().min(8, "Add a brief description (≥8 chars)").max(800),
  notes: z.string().max(800).optional(),
  time_spent_hours: z.number({ invalid_type_error: "Number" }).min(0.01, "Must be > 0").max(48, "Cap is 48h"),
});
type FormValues = z.infer<typeof schema>;

function NewTaskPage() {
  const session = useRequiredSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: projects = [] } = useQuery({ queryKey: ["projects", "mine", session.user.id], queryFn: () => projectsApi.forUser(session.user.id) });
  const { data: platforms = [] } = useQuery({ queryKey: ["platforms"], queryFn: () => platformsApi.list() });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { project_id: "", external_task_id: "", description: "", notes: "", time_spent_hours: 0 },
  });
  const projectId = form.watch("project_id");
  const project = useMemo(() => projects.find((p) => p.id === projectId), [projects, projectId]);
  const platform = platforms.find((p) => p.id === project?.platform_id);
  const { data: activeRate } = useQuery({
    queryKey: ["rate", "active", project?.platform_id],
    queryFn: () => platformsApi.activeRate(project!.platform_id),
    enabled: !!project,
  });

  const create = useMutation({
    mutationFn: (v: FormValues) =>
      tasksApi.create({
        project_id: v.project_id,
        submitted_by: session.user.id,
        external_task_id: v.external_task_id,
        description: v.description,
        notes: v.notes,
        time_spent_hours: v.time_spent_hours,
      }),
    onSuccess: async (task) => {
      const files = fileRef.current?.files;
      if (files && files.length) {
        for (const f of Array.from(files)) {
          await tasksApi.addAttachment(task.id, { name: f.name, type: f.type, size: f.size }, session.user.id);
        }
      }
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(`Task ${task.external_task_id} submitted`);
      navigate({ to: "/tasks/$taskId", params: { taskId: task.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = form.handleSubmit((v) => create.mutate(v));

  return (
    <PageBody>
      <PageHeader title="Submit task" description="Pick a project, enter the external ID, and attach evidence if you have any." />

      <form onSubmit={onSubmit} className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card className="border">
          <CardHeader><CardTitle className="text-sm">Task details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={(v) => form.setValue("project_id", v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder={projects.length ? "Choose a project" : "You aren't assigned to any project yet"} /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => {
                    const pl = platforms.find((x) => x.id === p.platform_id);
                    return (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} <span className="text-muted-foreground">· {pl?.name} ({pl?.currency})</span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {form.formState.errors.project_id && <p className="text-xs text-danger">{form.formState.errors.project_id.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ext">External task ID</Label>
                <Input id="ext" {...form.register("external_task_id")} placeholder="e.g. ALP-1042" className="font-mono" />
                {form.formState.errors.external_task_id && <p className="text-xs text-danger">{form.formState.errors.external_task_id.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hours">Time spent (hours)</Label>
                <Input id="hours" type="number" step="0.25" min="0" {...form.register("time_spent_hours", { valueAsNumber: true })} />
                {form.formState.errors.time_spent_hours && <p className="text-xs text-danger">{form.formState.errors.time_spent_hours.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" rows={3} {...form.register("description")} placeholder="What did you work on?" />
              {form.formState.errors.description && <p className="text-xs text-danger">{form.formState.errors.description.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Internal notes (optional)</Label>
              <Textarea id="notes" rows={2} {...form.register("notes")} placeholder="Anything the reviewer should know." />
            </div>

            <div className="space-y-1.5">
              <Label>Attachments</Label>
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed p-4 text-sm text-muted-foreground hover:border-primary/40 hover:bg-accent/30">
                <Upload className="size-4" />
                <span>Drag files here or <span className="font-medium text-foreground">browse</span></span>
                <input ref={fileRef} type="file" multiple className="sr-only" />
              </label>
              <p className="text-[11px] text-muted-foreground">Uploaded files get an opaque signed URL — never a raw path.</p>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="ghost" onClick={() => navigate({ to: "/tasks" })}>Cancel</Button>
              <Button type="submit" disabled={create.isPending}>{create.isPending ? "Submitting…" : "Submit task"}</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-surface">
          <CardHeader><CardTitle className="text-sm">Rate snapshot</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {project && platform ? (
              <>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Platform</div>
                  <div className="font-medium">{platform.name} <span className="text-xs text-muted-foreground">· {platform.currency}</span></div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Review</div>
                  <div className="text-sm">{project.requires_review ? "Requires team-lead review before platform submission." : "Auto-submitted to platform on save."}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Active rate</div>
                  {activeRate ? (
                    <div className="font-mono text-lg font-semibold tabular-nums">{formatMoney(activeRate.rate_per_task, platform.currency)} <span className="text-xs font-normal text-muted-foreground">/ task</span></div>
                  ) : (
                    <div className="rounded border border-dashed bg-card p-2 text-xs text-danger">
                      No active rate for this platform — can't submit until an admin adds one.
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">This rate is frozen on the task at submission time. Future rate changes don't affect it.</p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Pick a project to see its rate.</p>
            )}
          </CardContent>
        </Card>
      </form>
    </PageBody>
  );
}
