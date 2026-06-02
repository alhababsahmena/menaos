import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, Wallet } from "lucide-react";
import { PageBody, PageHeader } from "@/components/page";
import { DashboardFilters } from "@/components/dashboard-filters";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { financialsApi } from "@/services/api";
import { formatMoney } from "@/lib/format";
import type { DashboardFilterValues } from "@/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/financial")({
  component: FinancialDashboard,
});

function FinancialDashboard() {
  const [filters, setFilters] = useState<DashboardFilterValues>({});
  const { data, isLoading } = useQuery({ queryKey: ["earnings", filters], queryFn: () => financialsApi.earnings(filters) });

  const byCurrencyChart = useMemo(() => {
    return (data?.byCurrency ?? []).map((c) => ({
      currency: c.currency,
      Projected: c.projected,
      Actual: c.actual,
    }));
  }, [data]);

  const downloadCSV = () => {
    if (!data) return;
    const lines: string[] = ["project,platform,currency,projected,actual,variance,variance_pct"];
    for (const r of data.byProject) {
      const variance = r.actual - r.projected;
      const pct = r.projected ? Math.round((variance / r.projected) * 100) : 0;
      lines.push(`"${r.project}","${r.platform}",${r.currency},${r.projected.toFixed(2)},${r.actual.toFixed(2)},${variance.toFixed(2)},${pct}`);
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "menaos-earnings.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Earnings CSV exported");
  };

  return (
    <PageBody>
      <PageHeader
        title="Financial dashboard"
        description="Projected vs. actual earnings — segmented by currency, never summed across."
        actions={
          <Button size="sm" variant="outline" onClick={downloadCSV} disabled={!data || isLoading}>
            <Download className="size-3.5" /> Export CSV
          </Button>
        }
      />
      <DashboardFilters value={filters} onChange={setFilters} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(data?.byCurrency ?? []).map((c) => (
          <KpiCard
            key={c.currency}
            label={`Actual ${c.currency}`}
            value={formatMoney(c.actual, c.currency)}
            icon={Wallet}
            hint={`Projected ${formatMoney(c.projected, c.currency)} · ${c.accepted_tasks} accepted`}
          />
        ))}
      </div>

      <Card className="border">
        <CardHeader><CardTitle className="text-sm">Projected vs. actual</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCurrencyChart} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="currency" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip wrapperClassName="!rounded-md !border !bg-popover !text-popover-foreground" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Projected" fill="var(--status-pending)" />
              <Bar dataKey="Actual" fill="var(--status-accepted)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border">
        <CardHeader><CardTitle className="text-sm">By project</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-surface text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Project</th>
                <th className="px-4 py-2 text-left font-semibold">Platform</th>
                <th className="px-4 py-2 text-right font-semibold">Projected</th>
                <th className="px-4 py-2 text-right font-semibold">Actual</th>
                <th className="px-4 py-2 text-right font-semibold">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.byProject.map((r) => {
                const variance = r.actual - r.projected;
                const tone = variance >= 0 ? "text-[color:var(--status-accepted)]" : "text-[color:var(--status-rejected)]";
                return (
                  <tr key={r.project_id}>
                    <td className="px-4 py-2 font-medium">{r.project}</td>
                    <td className="px-4 py-2 text-muted-foreground">{r.platform}</td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums">{formatMoney(r.projected, r.currency)}</td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums">{formatMoney(r.actual, r.currency)}</td>
                    <td className={`px-4 py-2 text-right font-mono tabular-nums ${tone}`}>{formatMoney(variance, r.currency)}</td>
                  </tr>
                );
              })}
              {!data?.byProject.length && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">No data for the current filter.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </PageBody>
  );
}
