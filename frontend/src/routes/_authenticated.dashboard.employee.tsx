import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, CheckCircle2, XCircle, CalendarCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { PageBody, PageHeader } from "@/components/page";
import { KpiCard } from "@/components/kpi-card";
import { DataTable } from "@/components/data-table";
import { DashboardFilters } from "@/components/dashboard-filters";
import { StatusPill, type TaskStatus } from "@/components/status-pill";
import { availabilityApi, tasksApi } from "@/services/api";
import { useRequiredSession } from "@/lib/session";
import { formatRelative, daysBetween } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { Task, DashboardFilterValues } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";

export const Route = createFileRoute("/_authenticated/dashboard/employee")({
  component: EmployeeDashboard,
});

function EmployeeDashboard() {
  const session = useRequiredSession();
  const [filters, setFilters] = useState<DashboardFilterValues>({});

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", "mine", session.user.id, filters],
    queryFn: () => tasksApi.list({ ...filters, submittedBy: session.user.id }),
  });
  const { data: availability = [] } = useQuery({
    queryKey: ["availability", "mine", session.user.id],
    queryFn: () => availabilityApi.listForUser(session.user.id),
  });

  const kpis = useMemo(() => {
    const total = tasks.length;
    const accepted = tasks.filter((t) => t.status === "accepted").length;
    const rejected = tasks.filter((t) => t.status === "rejected").length;
    const decided = accepted + rejected;
    const rate = decided > 0 ? Math.round((accepted / decided) * 100) : 0;
    let streak = 0;
    for (const log of availability) {
      if (log.status === "active") streak++;
      else break;
    }
    return { total, accepted, rejected, rate, streak };
  }, [tasks, availability]);

  const cols: ColumnDef<Task>[] = useMemo(
    () => [
      { accessorKey: "external_task_id", header: "Task ID", cell: ({ row }) => (
        <Link to="/tasks/$taskId" params={{ taskId: row.original.id }} className="font-mono text-xs text-primary hover:underline">
          {row.original.external_task_id}
        </Link>
      )},
      { accessorKey: "description", header: "Description", cell: ({ row }) => (
        <span className="line-clamp-1 text-sm">{row.original.description}</span>
      )},
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusPill status={row.original.status as TaskStatus} /> },
      { accessorKey: "time_spent_hours", header: "Hours", cell: ({ row }) => <span className="tabular-nums">{row.original.time_spent_hours.toFixed(2)}</span> },
      { accessorKey: "submitted_at", header: "Submitted", cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatRelative(row.original.submitted_at)}</span> },
    ],
    [],
  );

  return (
    <>
      <PageBody>
        <PageHeader
          title={`Hello, ${session.user.first_name}`}
          description="Your tasks, your acceptance rate, your availability streak."
          actions={
            <Button asChild size="sm">
              <Link to="/tasks/new">Submit task</Link>
            </Button>
          }
        />

        <DashboardFilters value={filters} onChange={setFilters} />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Tasks submitted" value={kpis.total} icon={ClipboardList} hint="across all platforms" />
          <KpiCard label="Acceptance rate" value={`${kpis.rate}%`} icon={CheckCircle2} hint={`${kpis.accepted} of ${kpis.accepted + kpis.rejected} decided`} />
          <KpiCard label="Rejections" value={kpis.rejected} icon={XCircle} hint="needs follow-up" />
          <KpiCard label="Active streak" value={`${kpis.streak} day${kpis.streak === 1 ? "" : "s"}`} icon={CalendarCheck} hint="consecutive 'active' logs" />
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold">Recent tasks</h2>
          <DataTable
            columns={cols}
            data={tasks}
            isLoading={isLoading}
            emptyTitle="No tasks yet"
            emptyDescription="Submit your first task to start tracking."
            emptyAction={<Button asChild size="sm"><Link to="/tasks/new">Submit task</Link></Button>}
            onRowClick={(t) => location.assign(`/tasks/${t.id}`)}
          />
        </section>
      </PageBody>
    </>
  );
}

// (intentionally unused — silences TS6133 in some configs)
export { daysBetween };
