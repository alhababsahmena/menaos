import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/page";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/data-table";
import { StatusPill, type TaskStatus } from "@/components/status-pill";
import { ConflictError, projectsApi, tasksApi, usersApi } from "@/services/api";
import { useRequiredSession } from "@/lib/session";
import { formatRelative, fullName } from "@/lib/format";
import type { ColumnDef } from "@tanstack/react-table";
import type { Task } from "@/types";

export const Route = createFileRoute("/_authenticated/review")({
  component: ReviewPage,
});

type Tab = "awaiting-review" | "awaiting-platform";

function ReviewPage() {
  const [tab, setTab] = useState<Tab>("awaiting-review");
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", "review", tab],
    queryFn: () => tasksApi.list({ awaiting: tab === "awaiting-review" ? "review" : "platform" }),
  });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => usersApi.list() });
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: () => projectsApi.list() });

  // Only show requires_review projects in the queue
  const reviewProjects = new Set(projects.filter((p) => p.requires_review).map((p) => p.id));
  const filtered = tab === "awaiting-review" ? tasks.filter((t) => reviewProjects.has(t.project_id)) : tasks;

  const cols: ColumnDef<Task>[] = [
    { accessorKey: "external_task_id", header: "Task", cell: ({ row }) => (
      <Link to="/tasks/$taskId" params={{ taskId: row.original.id }} className="font-mono text-xs text-primary hover:underline">{row.original.external_task_id}</Link>
    )},
    { id: "submitter", header: "Submitter", cell: ({ row }) => {
      const u = users.find((x) => x.id === row.original.submitted_by);
      return <span className="text-sm">{u ? fullName(u) : "—"}</span>;
    }},
    { id: "project", header: "Project", cell: ({ row }) => projects.find((p) => p.id === row.original.project_id)?.name ?? "—" },
    { id: "submitted", header: "Submitted", cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatRelative(row.original.submitted_at)}</span> },
    { id: "status", header: "Status", cell: ({ row }) => <StatusPill status={row.original.status as TaskStatus} /> },
    { id: "actions", header: "", cell: ({ row }) => <ReviewActions task={row.original} disabled={tab === "awaiting-platform"} /> },
  ];

  return (
    <PageBody>
      <PageHeader title="Review queue" description="Approve or send back tasks. Submission to the platform happens on approve." />
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value="awaiting-review">Awaiting review</TabsTrigger>
          <TabsTrigger value="awaiting-platform">Submitted, awaiting platform</TabsTrigger>
        </TabsList>
      </Tabs>
      <Card className="border">
        <CardContent className="p-0">
          <DataTable
            columns={cols}
            data={filtered}
            isLoading={isLoading}
            emptyTitle="Queue clear"
            emptyDescription={tab === "awaiting-review" ? "Nothing waiting for your review." : "No tasks pending platform decision."}
          />
        </CardContent>
      </Card>
    </PageBody>
  );
}

function ReviewActions({ task, disabled }: { task: Task; disabled?: boolean }) {
  const session = useRequiredSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const approve = useMutation({
    mutationFn: () => tasksApi.approveReview(task.id, task.version, session.user.id),
    onSuccess: () => { toast.success(`Approved ${task.external_task_id}`); qc.invalidateQueries({ queryKey: ["tasks"] }); },
    onError: (e) => e instanceof ConflictError ? (toast.warning("Refresh — data changed"), qc.invalidateQueries({ queryKey: ["tasks"] })) : toast.error((e as Error).message),
  });
  const sendBack = useMutation({
    mutationFn: () => tasksApi.sendBack(task.id, task.version, session.user.id, reason),
    onSuccess: () => { toast.success("Sent back"); setOpen(false); qc.invalidateQueries({ queryKey: ["tasks"] }); },
    onError: (e) => toast.error((e as Error).message),
  });

  if (disabled) return <span className="text-xs text-muted-foreground">Awaiting platform</span>;

  return (
    <div className="flex justify-end gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button size="sm" variant="outline">Send back</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Send back to submitter</DialogTitle></DialogHeader>
          <Label className="text-xs">Reason</Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="What needs to be fixed?" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => sendBack.mutate()} disabled={sendBack.isPending || reason.length < 4}>Send back</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button size="sm" onClick={() => approve.mutate()} disabled={approve.isPending}>Approve & submit</Button>
    </div>
  );
}
