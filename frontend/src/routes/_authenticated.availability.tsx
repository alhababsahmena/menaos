import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/status-pill";
import { availabilityApi } from "@/services/api";
import { useRequiredSession } from "@/lib/session";
import { formatDate } from "@/lib/format";
import type { AvailabilityStatus } from "@/types";

export const Route = createFileRoute("/_authenticated/availability")({
  component: AvailabilityPage,
});

const today = () => new Date().toISOString().slice(0, 10);

function AvailabilityPage() {
  const session = useRequiredSession();
  const qc = useQueryClient();
  const { data: logs = [] } = useQuery({
    queryKey: ["availability", "mine", session.user.id],
    queryFn: () => availabilityApi.listForUser(session.user.id),
  });

  const [date, setDate] = useState(today());
  const [status, setStatus] = useState<AvailabilityStatus>("active");
  const [note, setNote] = useState("");
  const existingToday = logs.find((l) => l.log_date === date);

  const mutate = useMutation({
    mutationFn: () => availabilityApi.log({ user_id: session.user.id, log_date: date, status, note: note || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["availability"] });
      toast.success("Availability logged");
      setNote("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const last7 = logs.slice(0, 7);

  return (
    <PageBody>
      <PageHeader title="Availability" description="One log per day. Be honest — it drives staffing." />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-sm">Log a day</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="al-date">Date</Label>
              <Input id="al-date" type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} />
              {existingToday && (
                <p className="text-[11px] text-warning">
                  You already logged this date as <span className="font-medium">{existingToday.status}</span> — submitting will overwrite.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as AvailabilityStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active — working</SelectItem>
                  <SelectItem value="absent">Absent — leave / sick</SelectItem>
                  <SelectItem value="blocked">Blocked — can't work</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="al-note">Note (optional)</Label>
              <Textarea id="al-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Platform queue empty since 11:00" rows={3} />
            </div>
            <Button onClick={() => mutate.mutate()} disabled={mutate.isPending} className="w-full">
              {mutate.isPending ? "Saving…" : existingToday ? "Update log" : "Log day"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm"><CalendarDays className="size-4" /> Last 7 logs</CardTitle>
          </CardHeader>
          <CardContent>
            {last7.length === 0 ? (
              <p className="text-xs text-muted-foreground">No logs yet — start with today.</p>
            ) : (
              <ul className="divide-y">
                {last7.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 py-2.5">
                    <div className="font-mono text-xs text-muted-foreground">{formatDate(l.log_date)}</div>
                    <StatusPill status={l.status} />
                    {l.note && <span className="line-clamp-1 text-xs text-muted-foreground">{l.note}</span>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </PageBody>
  );
}
