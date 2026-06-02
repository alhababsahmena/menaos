import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AlarmClock, Gavel, Users2, AlertOctagon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageBody, PageHeader } from "@/components/page";
import { KpiCard } from "@/components/kpi-card";
import { DashboardFilters } from "@/components/dashboard-filters";
import { DataTable } from "@/components/data-table";
import { StatusPill, type TaskStatus } from "@/components/status-pill";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { availabilityApi, disputesApi, tasksApi, usersApi } from "@/services/api";
import { daysBetween, formatRelative, fullName } from "@/lib/format";
import type { ColumnDef } from "@tanstack/react-table";
import type { DashboardFilterValues, Task } from "@/types";

export const Route = createFileRoute("/_authenticated/dashboard/team-lead")({
  component: TeamLeadDashboard,
});

function TeamLeadDashboard() {
  const [filters, setFilters] = useState<DashboardFilterValues>({});

  const { data: tasks = [] } = useQuery({ queryKey: ["tasks", "all", filters], queryFn: () => tasksApi.list(filters) });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => usersApi.list() });
  const { data: avail = [] } = useQuery({ queryKey: ["availability", "team"], queryFn: () => availabilityApi.listForTeam() });
  const { data: disputes = [] } = useQuery({ queryKey: ["disputes"], queryFn: () => disputesApi.overview() });

  const awaitingReview = tasks.filter((t) => t.status === "pending" && !t.reviewed_at).length;
  const openCounters = disputes.filter((d) => d.counter && d.counter.lead_decision === "pending").length;
  const staleDisputes = disputes.filter((d) => d.dispute?.outcome === "pending" && daysBetween(d.dispute.submitted_at) > 5);

  const perMember = useMemo(() => {
    const map = new Map<string, { name: string; submitted: number; accepted: number; rejected: number }>();
    for (const t of tasks) {
      const u = users.find((x) => x.id === t.submitted_by);
      if (!u) continue;
      const e = map.get(u.id) ?? { name: fullName(u), submitted: 0, accepted: 0, rejected: 0 };
      e.submitted++;
      if (t.status === "accepted") e.accepted++;
      if (t.status === "rejected") e.rejected++;
      map.set(u.id, e);
    }
    return [...map.values()];
  }, [tasks, users]);

  const rejectionCols: ColumnDef<typeof disputes[number]>[] = [
    { id: "task", header: "Task", cell: ({ row }) => (
      <Link to="/tasks/$taskId" params={{ taskId: row.original.task.id }} className="font-mono text-xs text-primary hover:underline">
        {row.original.task.external_task_id}
      </Link>
    )},
    { id: "project", header: "Project", cell: ({ row }) => <span className="text-sm">{row.original.project.name}</span> },
    { id: "stage", header: "Stage", cell: ({ row }) => {
      if (row.original.dispute) return <StatusPill status={row.original.dispute.outcome} label={`Platform: ${row.original.dispute.outcome}`} />;
      if (row.original.counter) return <StatusPill status={row.original.counter.lead_decision === "pending" ? "pending" : row.original.counter.lead_decision === "escalated" ? "escalated" : "rejected"} label={`TL: ${row.original.counter.lead_decision}`} />;
      return <StatusPill status="rejected" label="No counter" />;
    }},
    { id: "aging", header: "Age", cell: ({ row }) => {
      const start = row.original.dispute?.submitted_at ?? row.original.counter?.created_at ?? row.original.rejection.rejected_at;
      return <span className="text-xs text-muted-foreground">{daysBetween(start)}d</span>;
    }},
  ];

  const taskCols: ColumnDef<Task>[] = [
    { accessorKey: "external_task_id", header: "Task", cell: ({ row }) => (
      <Link to="/tasks/$taskId" params={{ taskId: row.original.id }} className="font-mono text-xs text-primary hover:underline">
        {row.original.external_task_id}
      </Link>
    )},
    { id: "by", header: "Submitter", cell: ({ row }) => {
      const u = users.find((x) => x.id === row.original.submitted_by);
      return <span className="text-sm">{u ? fullName(u) : "—"}</span>;
    }},
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusPill status={row.original.status as TaskStatus} /> },
    { accessorKey: "submitted_at", header: "Submitted", cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatRelative(row.original.submitted_at)}</span> },
  ];

  return (
    <PageBody>
      <PageHeader title="Team-lead dashboard" description="Utilization, performance, and the live dispute queue." />
      <DashboardFilters value={filters} onChange={setFilters} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Awaiting review" value={awaitingReview} icon={AlarmClock} hint="needs your action" />
        <KpiCard label="Open counter-arguments" value={openCounters} icon={Gavel} hint="awaiting your decision" />
        <KpiCard label="Stale platform disputes" value={staleDisputes.length} icon={AlertOctagon} hint=">5 days, no outcome" />
        <KpiCard label="Active staff today" value={avail.filter((a) => a.status === "active").length} icon={Users2} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border">
          <CardHeader><CardTitle className="text-sm">Per-member performance</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perMember} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip wrapperClassName="!rounded-md !border !bg-popover !text-popover-foreground" />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="accepted" stackId="a" fill="var(--status-accepted)" />
                <Bar dataKey="rejected" stackId="a" fill="var(--status-rejected)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader><CardTitle className="text-sm">Open disputes</CardTitle></CardHeader>
          <CardContent>
            <DataTable columns={rejectionCols} data={disputes} pageSize={6} emptyTitle="No disputes" />
          </CardContent>
        </Card>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Awaiting your review</h2>
        <DataTable
          columns={taskCols}
          data={tasks.filter((t) => t.status === "pending" && !t.reviewed_at)}
          pageSize={5}
          emptyTitle="Queue clear"
          emptyDescription="No tasks awaiting team-lead review."
        />
      </section>
    </PageBody>
  );
}
