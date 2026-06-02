import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, FileText, History as HistoryIcon, Paperclip, PencilLine } from "lucide-react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatusPill, type TaskStatus } from "@/components/status-pill";
import { UserAvatar } from "@/components/user-avatar";
import { DisputeTimeline } from "@/components/dispute-timeline";
import {
  categoriesApi, ConflictError, disputesApi, platformsApi, projectsApi, tasksApi, usersApi,
} from "@/services/api";
import { useRequiredSession } from "@/lib/session";
import { usePermissions } from "@/lib/permissions";
import { formatBytes, formatDate, formatMoney, formatRelative, fullName } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/tasks/$taskId")({
  component: TaskDetailPage,
});

function TaskDetailPage() {
  const { taskId } = Route.useParams();
  const session = useRequiredSession();
  const { has } = usePermissions();
  const qc = useQueryClient();

  const { data: task, isLoading } = useQuery({ queryKey: ["task", taskId], queryFn: () => tasksApi.get(taskId) });
  const { data: attachments = [] } = useQuery({ queryKey: ["task", taskId, "att"], queryFn: () => tasksApi.attachments(taskId) });
  const { data: history = [] } = useQuery({ queryKey: ["task", taskId, "hist"], queryFn: () => tasksApi.history(taskId) });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => usersApi.list() });
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: () => projectsApi.list() });
  const { data: platforms = [] } = useQuery({ queryKey: ["platforms"], queryFn: () => platformsApi.list() });
  const { data: categories = [] } = useQuery({ queryKey: ["rc"], queryFn: () => categoriesApi.list() });
  const { data: disputeRows = [] } = useQuery({ queryKey: ["disputes"], queryFn: () => disputesApi.overview() });

  const project = task && projects.find((p) => p.id === task.project_id);
  const platform = project && platforms.find((p) => p.id === project.platform_id);
  const submitter = task && users.find((u) => u.id === task.submitted_by);
  const reviewer = task?.reviewed_by ? users.find((u) => u.id === task.reviewed_by) : null;
  const dispute = disputeRows.find((d) => d.task.id === taskId);

  const handleConflict = (e: unknown) => {
    if (e instanceof ConflictError) {
      qc.invalidateQueries({ queryKey: ["task", taskId] });
      toast.warning("Data changed — please review the updated task.");
      return true;
    }
    return false;
  };

  const updateStatus = useMutation({
    mutationFn: (next: TaskStatus) => tasksApi.updateStatus(taskId, task!.version, next, session.user.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["task", taskId] }); toast.success("Status updated"); },
    onError: (e) => { if (!handleConflict(e)) toast.error((e as Error).message); },
  });

  if (isLoading || !task) {
    return <PageBody><div className="text-sm text-muted-foreground">Loading task…</div></PageBody>;
  }

  const isOwner = task.submitted_by === session.user.id;
  const canMarkAccepted = isOwner && has("tasks.update_status") && (task.status === "pending" || task.status === "escalated");
  const canMarkRejected = isOwner && has("tasks.update_status") && task.status === "pending";

  return (
    <PageBody>
      <PageHeader
        title={`Task ${task.external_task_id}`}
        description={`${project?.name ?? "—"} · ${platform?.name ?? "—"}`}
        actions={<Button asChild variant="ghost" size="sm"><Link to="/tasks"><ArrowLeft className="size-3.5" /> Back to tasks</Link></Button>}
      />

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Card className="border">
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
              <div>
                <CardTitle className="text-sm">Details</CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">Submitted {formatRelative(task.submitted_at)}</p>
              </div>
              <StatusPill status={task.status as TaskStatus} size="md" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Meta label="Description"><p className="text-sm leading-relaxed">{task.description}</p></Meta>
              {task.notes && <Meta label="Notes"><p className="text-sm leading-relaxed text-muted-foreground">{task.notes}</p></Meta>}
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <Stat label="Hours" value={task.time_spent_hours.toFixed(2)} />
                <Stat label="Rate snapshot" value={platform ? formatMoney(task.rate_snapshot, platform.currency) : "—"} />
                <Stat label="Version" value={task.version} />
                <Stat label="Reviewed" value={task.reviewed_at ? formatRelative(task.reviewed_at) : "—"} />
              </div>
              <Separator />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {submitter && (
                    <span className="flex items-center gap-1.5">
                      <UserAvatar name={fullName(submitter)} photoUrl={submitter.photo_url} size="xs" />
                      Submitted by {fullName(submitter)}
                    </span>
                  )}
                  {reviewer && <span>· Reviewed by {fullName(reviewer)}</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {isOwner && <CorrectionDialog task={task} onSaved={() => qc.invalidateQueries({ queryKey: ["task", taskId] })} />}
                  {canMarkAccepted && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus.mutate("accepted")} disabled={updateStatus.isPending}>
                      Mark accepted
                    </Button>
                  )}
                  {canMarkRejected && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus.mutate("rejected")} disabled={updateStatus.isPending}>
                      Mark rejected
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-sm"><Paperclip className="size-4" /> Attachments</CardTitle>
              <span className="text-xs text-muted-foreground">{attachments.length} file{attachments.length === 1 ? "" : "s"}</span>
            </CardHeader>
            <CardContent>
              {attachments.length === 0 ? (
                <p className="text-xs text-muted-foreground">No attachments uploaded.</p>
              ) : (
                <ul className="divide-y">
                  {attachments.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 py-2.5">
                      <FileText className="size-4 text-muted-foreground" />
                      <a href={a.storage_url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate text-sm hover:text-primary">{a.file_name}</a>
                      <span className="text-xs text-muted-foreground">{formatBytes(a.file_size_bytes)}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(a.uploaded_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Dispute section */}
          {task.status === "rejected" && !dispute?.rejection && (
            <Card className="border bg-[color:var(--status-rejected)]/5">
              <CardHeader><CardTitle className="text-sm">Log rejection feedback</CardTitle></CardHeader>
              <CardContent>
                <LogRejectionForm taskId={task.id} categories={categories} onDone={() => qc.invalidateQueries()} />
              </CardContent>
            </Card>
          )}

          {dispute && (
            <Card className="border">
              <CardHeader><CardTitle className="text-sm">Dispute chain</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <DisputeTimeline
                  rejection={dispute.rejection}
                  counter={dispute.counter}
                  dispute={dispute.dispute}
                  categoryName={categories.find((c) => c.id === dispute.rejection.category_id)?.name}
                />

                {isOwner && !dispute.counter && (
                  <WriteCounterForm rejectionId={dispute.rejection.id} onDone={() => qc.invalidateQueries()} />
                )}
                {has("disputes.decide") && dispute.counter && dispute.counter.lead_decision === "pending" && (
                  <DecideCounterForm counterId={dispute.counter.id} onDone={() => qc.invalidateQueries()} />
                )}
                {has("disputes.record_outcome") && dispute.dispute && dispute.dispute.outcome === "pending" && (
                  <RecordOutcomeForm disputeId={dispute.dispute.id} onDone={() => qc.invalidateQueries()} />
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="border">
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><HistoryIcon className="size-4" /> History</CardTitle></CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground">No history yet.</p>
            ) : (
              <ol className="space-y-3">
                {[...history].reverse().map((h) => {
                  const actor = users.find((u) => u.id === h.actor_id);
                  return (
                    <li key={h.id} className="flex gap-3">
                      <UserAvatar name={actor ? fullName(actor) : "?"} photoUrl={actor?.photo_url ?? null} size="xs" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs">
                          <span className="font-medium">{actor ? fullName(actor) : "Unknown"}</span>
                          <span className="text-muted-foreground"> · {h.kind.replace(/_/g, " ")}</span>
                        </div>
                        {(h.from_value || h.to_value) && (
                          <div className="font-mono text-[10px] text-muted-foreground">
                            {h.from_value && <span>{h.from_value} </span>}
                            {h.from_value && h.to_value && <span>→ </span>}
                            {h.to_value && <span>{h.to_value}</span>}
                          </div>
                        )}
                        {h.note && <div className="text-xs text-muted-foreground">{h.note}</div>}
                        <div className="text-[10px] text-muted-foreground">{formatRelative(h.at)}</div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </PageBody>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function CorrectionDialog({ task, onSaved }: { task: { id: string; version: number; time_spent_hours: number; description: string; notes?: string }; onSaved: () => void }) {
  const session = useRequiredSession();
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(task.time_spent_hours);
  const [notes, setNotes] = useState(task.notes ?? "");
  const m = useMutation({
    mutationFn: () => tasksApi.correct(task.id, task.version, { time_spent_hours: hours, notes }, session.user.id),
    onSuccess: () => { toast.success("Correction saved"); setOpen(false); onSaved(); },
    onError: (e) => {
      if (e instanceof ConflictError) { toast.warning("Data changed — refresh."); onSaved(); }
      else toast.error((e as Error).message);
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="ghost"><PencilLine className="size-3.5" /> Correct log</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Correct task log</DialogTitle>
          <DialogDescription>Change-records are kept in the history for auditing.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Hours</Label>
            <Input type="number" step="0.25" value={hours} onChange={(e) => setHours(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => m.mutate()} disabled={m.isPending}>{m.isPending ? "Saving…" : "Save correction"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LogRejectionForm({ taskId, categories, onDone }: { taskId: string; categories: { id: string; name: string; is_active: boolean }[]; onDone: () => void }) {
  const [categoryId, setCategoryId] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const m = useMutation({
    mutationFn: () => disputesApi.logRejection({ task_id: taskId, category_id: categoryId, feedback }),
    onSuccess: () => { toast.success("Rejection logged"); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger><SelectValue placeholder="Pick a category" /></SelectTrigger>
          <SelectContent>
            {categories.filter((c) => c.is_active).map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Feedback from the platform</Label>
        <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} placeholder="Paste the verbatim platform feedback…" />
      </div>
      <Button onClick={() => m.mutate()} disabled={m.isPending || !categoryId || feedback.length < 4} size="sm">
        {m.isPending ? "Saving…" : "Log rejection"}
      </Button>
    </div>
  );
}

function WriteCounterForm({ rejectionId, onDone }: { rejectionId: string; onDone: () => void }) {
  const session = useRequiredSession();
  const [argument, setArgument] = useState("");
  const m = useMutation({
    mutationFn: () => disputesApi.writeCounter({ rejection_id: rejectionId, argument, actor_id: session.user.id }),
    onSuccess: () => { toast.success("Counter-argument submitted"); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="space-y-2 rounded-md border bg-surface p-3">
      <Label className="text-xs">Your counter-argument</Label>
      <Textarea value={argument} onChange={(e) => setArgument(e.target.value)} rows={3} placeholder="Why was the rejection wrong?" />
      <Button size="sm" onClick={() => m.mutate()} disabled={m.isPending || argument.length < 6}>
        {m.isPending ? "Submitting…" : "Submit counter-argument"}
      </Button>
    </div>
  );
}

function DecideCounterForm({ counterId, onDone }: { counterId: string; onDone: () => void }) {
  const session = useRequiredSession();
  const m = useMutation({
    mutationFn: (decision: "rejected" | "escalated") => disputesApi.decideCounter({ counter_id: counterId, decision, reviewer_id: session.user.id }),
    onSuccess: () => { toast.success("Decision recorded"); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="flex gap-2 rounded-md border bg-surface p-3">
      <span className="self-center text-xs text-muted-foreground">As team lead:</span>
      <Button size="sm" variant="outline" onClick={() => m.mutate("rejected")} disabled={m.isPending}>Reject counter</Button>
      <Button size="sm" onClick={() => m.mutate("escalated")} disabled={m.isPending}>Escalate to platform</Button>
    </div>
  );
}

function RecordOutcomeForm({ disputeId, onDone }: { disputeId: string; onDone: () => void }) {
  const session = useRequiredSession();
  const [notes, setNotes] = useState("");
  const m = useMutation({
    mutationFn: (outcome: "won" | "lost") => disputesApi.recordOutcome({ dispute_id: disputeId, outcome, notes: notes || undefined, reviewer_id: session.user.id }),
    onSuccess: () => { toast.success("Outcome recorded"); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="space-y-2 rounded-md border bg-surface p-3">
      <Label className="text-xs">Platform notes (optional)</Label>
      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => m.mutate("lost")} disabled={m.isPending}>Lost</Button>
        <Button size="sm" onClick={() => m.mutate("won")} disabled={m.isPending}>Won</Button>
      </div>
    </div>
  );
}
