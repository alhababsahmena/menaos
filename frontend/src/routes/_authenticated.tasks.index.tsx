import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageBody, PageHeader } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/data-table";
import { StatusPill, type TaskStatus } from "@/components/status-pill";
import { tasksApi, usersApi } from "@/services/api";
import { useSession } from "@/lib/session";
import { usePermissions } from "@/lib/permissions";
import { formatRelative, fullName } from "@/lib/format";
import type { ColumnDef } from "@tanstack/react-table";
import type { Task } from "@/types";

export const Route = createFileRoute("/_authenticated/tasks/")({
  component: TasksListPage,
});

function TasksListPage() {
  const { session } = useSession();
  const { has, hasAny } = usePermissions();
  const seeAll = has("tasks.view_all") || has("tasks.view_team");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [search, setSearch] = useState("");

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", seeAll ? "all" : "mine", session?.user.id, statusFilter],
    queryFn: () =>
      tasksApi.list({
        status: statusFilter,
        submittedBy: seeAll ? undefined : session?.user.id,
      }),
  });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => usersApi.list(), enabled: seeAll });

  const filtered = useMemo(
    () => tasks.filter((t) => !search || (t.external_task_id + " " + t.description).toLowerCase().includes(search.toLowerCase())),
    [tasks, search],
  );

  const cols: ColumnDef<Task>[] = useMemo(() => {
    const c: ColumnDef<Task>[] = [
      { accessorKey: "external_task_id", header: "Task ID", cell: ({ row }) => (
        <Link to="/tasks/$taskId" params={{ taskId: row.original.id }} className="font-mono text-xs text-primary hover:underline">
          {row.original.external_task_id}
        </Link>
      )},
    ];
    if (seeAll) {
      c.push({ id: "by", header: "Submitter", cell: ({ row }) => {
        const u = users.find((x) => x.id === row.original.submitted_by);
        return <span className="text-sm">{u ? fullName(u) : "—"}</span>;
      }});
    }
    c.push(
      { accessorKey: "description", header: "Description", cell: ({ row }) => <span className="line-clamp-1 text-sm">{row.original.description}</span> },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusPill status={row.original.status as TaskStatus} /> },
      { accessorKey: "time_spent_hours", header: "Hours", cell: ({ row }) => <span className="tabular-nums">{row.original.time_spent_hours.toFixed(2)}</span> },
      { accessorKey: "submitted_at", header: "Submitted", cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatRelative(row.original.submitted_at)}</span> },
    );
    return c;
  }, [seeAll, users]);

  return (
    <PageBody>
      <PageHeader
        title="Tasks"
        description={seeAll ? "All tasks across the team." : "Your task submissions."}
        actions={hasAny("tasks.create") && (
          <Button asChild size="sm"><Link to="/tasks/new"><Plus className="size-3.5" /> New task</Link></Button>
        )}
      />

      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID or description…" className="h-9 w-[260px] pl-8" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | "all")}>
          <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={cols}
        data={filtered}
        isLoading={isLoading}
        emptyTitle="No tasks match"
        emptyDescription="Try changing the filters or submit a new task."
      />
    </PageBody>
  );
}
