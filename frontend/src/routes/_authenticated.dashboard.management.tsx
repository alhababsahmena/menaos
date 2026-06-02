import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Building2, Users2, ClipboardCheck, AlertTriangle } from "lucide-react";
import { PageBody, PageHeader } from "@/components/page";
import { KpiCard } from "@/components/kpi-card";
import { DashboardFilters } from "@/components/dashboard-filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Can, usePermissions } from "@/lib/permissions";
import { financialsApi, tasksApi, usersApi } from "@/services/api";
import { formatMoney } from "@/lib/format";
import type { DashboardFilterValues } from "@/types";

export const Route = createFileRoute("/_authenticated/dashboard/management")({
  component: ManagementDashboard,
});

const STATUS_COLORS = {
  pending: "var(--status-pending)",
  accepted: "var(--status-accepted)",
  rejected: "var(--status-rejected)",
  escalated: "var(--status-escalated)",
} as const;

function ManagementDashboard() {
  const [filters, setFilters] = useState<DashboardFilterValues>({});
  const { has } = usePermissions();
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks", "all", filters], queryFn: () => tasksApi.list(filters) });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => usersApi.list() });
  const { data: earnings } = useQuery({
    queryKey: ["earnings", filters],
    queryFn: () => financialsApi.earnings(filters),
    enabled: has("financials.view"),
  });

  const statusBreakdown = useMemo(() => {
    const counts = { pending: 0, accepted: 0, rejected: 0, escalated: 0 } as Record<string, number>;
    for (const t of tasks) counts[t.status]++;
    return Object.entries(counts).map(([k, v]) => ({ name: k, value: v }));
  }, [tasks]);

  return (
    <PageBody>
      <PageHeader title="Management overview" description="Company-wide operational health across all projects." />
      <DashboardFilters value={filters} onChange={setFilters} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Tasks (total)" value={tasks.length} icon={ClipboardCheck} />
        <KpiCard label="Active staff" value={users.filter((u) => u.is_active).length} icon={Users2} />
        <KpiCard label="Open escalations" value={tasks.filter((t) => t.status === "escalated").length} icon={AlertTriangle} />
        <KpiCard label="Acceptance %" value={
          tasks.length ? `${Math.round((tasks.filter((t) => t.status === "accepted").length / tasks.length) * 100)}%` : "—"
        } icon={Building2} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="border">
          <CardHeader><CardTitle className="text-sm">Task status mix</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusBreakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {statusBreakdown.map((s) => (
                    <Cell key={s.name} fill={STATUS_COLORS[s.name as keyof typeof STATUS_COLORS]} />
                  ))}
                </Pie>
                <Tooltip wrapperClassName="!rounded-md !border !bg-popover !text-popover-foreground" />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
              {statusBreakdown.map((s) => (
                <div key={s.name}>
                  <div className="font-mono text-base font-semibold tabular-nums">{s.value}</div>
                  <div className="capitalize text-muted-foreground">{s.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Can permission="financials.view" fallback={
          <Card className="border bg-muted/30">
            <CardContent className="grid h-full place-items-center p-8 text-center text-sm text-muted-foreground">
              Financial summary requires the <span className="mx-1 font-mono">financials.view</span> permission.
            </CardContent>
          </Card>
        }>
          <Card className="border">
            <CardHeader><CardTitle className="text-sm">Earnings by currency</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {earnings?.byCurrency.length ? earnings.byCurrency.map((c) => (
                <div key={c.currency} className="rounded-md border bg-surface p-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.currency}</span>
                    <span className="font-mono text-lg font-bold tabular-nums">{formatMoney(c.actual, c.currency)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Projected: <span className="font-mono">{formatMoney(c.projected, c.currency)}</span></span>
                    <span>{c.accepted_tasks} accepted · {c.pending_tasks} pending</span>
                  </div>
                </div>
              )) : <p className="text-xs text-muted-foreground">No earnings yet for the current filter.</p>}
              <p className="text-[10px] text-muted-foreground">Currencies are tracked separately — never summed.</p>
            </CardContent>
          </Card>
        </Can>
      </div>
    </PageBody>
  );
}
