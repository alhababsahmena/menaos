import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { platformsApi } from "@/services/api";
import { formatMoney, formatDate } from "@/lib/format";
import type { Currency } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/platforms")({
  component: PlatformsAdminPage,
});

function PlatformsAdminPage() {
  const qc = useQueryClient();
  const { data: platforms = [], isLoading } = useQuery({ queryKey: ["platforms", "rates"], queryFn: () => platformsApi.listWithRates() });

  return (
    <PageBody>
      <PageHeader
        title="Platforms & rates"
        description="Currency is locked per platform. Adding a rate auto-closes the current window — never overlaps."
        actions={<CreatePlatform onCreated={() => qc.invalidateQueries({ queryKey: ["platforms"] })} />}
      />
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
        <div className="space-y-4">
          {platforms.map((p) => (
            <Card key={p.id} className="border">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {p.name}
                    <span className="rounded bg-accent px-1.5 py-0.5 font-mono text-[10px] text-accent-foreground">{p.currency}</span>
                  </CardTitle>
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.rates.length} rate window{p.rates.length === 1 ? "" : "s"}</p>
                </div>
                <AddRateButton platformId={p.id} currency={p.currency} onAdded={() => qc.invalidateQueries({ queryKey: ["platforms"] })} />
              </CardHeader>
              <CardContent>
                <ol className="space-y-1.5">
                  {p.rates.map((r) => {
                    const isCurrent = r.effective_to == null;
                    return (
                      <li key={r.id} className={`flex items-center gap-3 rounded-md border p-2.5 text-sm ${isCurrent ? "border-primary/40 bg-primary/5" : "bg-card"}`}>
                        <span className="font-mono text-sm font-semibold tabular-nums">{formatMoney(r.rate_per_task, p.currency)} <span className="text-xs font-normal text-muted-foreground">/ task</span></span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(r.effective_from)} → {r.effective_to ? formatDate(r.effective_to) : <span className="text-primary">current</span>}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageBody>
  );
}

function CreatePlatform({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const m = useMutation({
    mutationFn: () => platformsApi.create({ name, currency, is_active: true }),
    onSuccess: () => { toast.success("Platform created"); setOpen(false); setName(""); onCreated(); },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="size-3.5" /> New platform</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New platform</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-1.5">
            <Label>Currency (locked once created)</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="JOD">JOD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => m.mutate()} disabled={!name || m.isPending}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddRateButton({ platformId, currency, onAdded }: { platformId: string; currency: Currency; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [rate, setRate] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const m = useMutation({
    mutationFn: () => platformsApi.addRate(platformId, rate, new Date(date).toISOString()),
    onSuccess: () => { toast.success("Rate added — previous window closed"); setOpen(false); setRate(0); onAdded(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="size-3.5" /> Add rate</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add a new rate</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Rate per task ({currency})</Label>
            <Input type="number" step="0.01" value={rate} onChange={(e) => setRate(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-1.5">
            <Label>Effective from</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <p className="text-[11px] text-muted-foreground">The current open window will close at this date.</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => m.mutate()} disabled={rate <= 0 || m.isPending}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
