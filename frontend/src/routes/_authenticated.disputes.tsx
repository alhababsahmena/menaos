import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, PageHeader } from "@/components/page";
import { categoriesApi, disputesApi } from "@/services/api";
import { StatusPill } from "@/components/status-pill";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { daysBetween, formatRelative } from "@/lib/format";
import type { ColumnDef } from "@tanstack/react-table";

export const Route = createFileRoute("/_authenticated/disputes")({
  component: DisputesPage,
});

type Row = Awaited<ReturnType<typeof disputesApi.overview>>[number];

function DisputesPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ["disputes"], queryFn: () => disputesApi.overview() });
  const { data: cats = [] } = useQuery({ queryKey: ["rc"], queryFn: () => categoriesApi.list() });

  const cols: ColumnDef<Row>[] = [
    { id: "task", header: "Task", cell: ({ row }) => (
      <Link to="/tasks/$taskId" params={{ taskId: row.original.task.id }} className="font-mono text-xs text-primary hover:underline">{row.original.task.external_task_id}</Link>
    )},
    { id: "project", header: "Project", cell: ({ row }) => <span className="text-sm">{row.original.project.name} <span className="text-xs text-muted-foreground">· {row.original.platform.name}</span></span> },
    { id: "category", header: "Category", cell: ({ row }) => <span className="text-xs">{cats.find((c) => c.id === row.original.rejection.category_id)?.name ?? "—"}</span> },
    { id: "stage", header: "Stage", cell: ({ row }) => {
      if (row.original.dispute) return <StatusPill status={row.original.dispute.outcome} label={`Platform: ${row.original.dispute.outcome}`} />;
      if (row.original.counter) return <StatusPill status={row.original.counter.lead_decision === "pending" ? "pending" : row.original.counter.lead_decision === "escalated" ? "escalated" : "rejected"} label={`TL: ${row.original.counter.lead_decision}`} />;
      return <StatusPill status="rejected" label="Awaiting counter" />;
    }},
    { id: "since", header: "Since", cell: ({ row }) => {
      const start = row.original.dispute?.submitted_at ?? row.original.counter?.created_at ?? row.original.rejection.rejected_at;
      return <span className="text-xs text-muted-foreground">{formatRelative(start)} · {daysBetween(start)}d</span>;
    }},
  ];

  return (
    <PageBody>
      <PageHeader title="Disputes" description="Every rejection and its chain — open it to act." />
      <Card className="border">
        <CardContent className="p-0">
          <DataTable
            columns={cols}
            data={data}
            isLoading={isLoading}
            emptyTitle="No disputes"
            emptyDescription="Every accepted task is a step toward not seeing this page."
            onRowClick={(r) => location.assign(`/tasks/${r.task.id}`)}
          />
        </CardContent>
      </Card>
    </PageBody>
  );
}
