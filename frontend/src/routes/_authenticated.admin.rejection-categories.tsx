import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { categoriesApi } from "@/services/api";

export const Route = createFileRoute("/_authenticated/admin/rejection-categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const qc = useQueryClient();
  const { data: cats = [] } = useQuery({ queryKey: ["rc"], queryFn: () => categoriesApi.list() });
  const toggle = useMutation({
    mutationFn: ({ id, on }: { id: string; on: boolean }) => categoriesApi.update(id, { is_active: on }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rc"] }); toast.success("Updated"); },
  });

  return (
    <PageBody>
      <PageHeader
        title="Rejection categories"
        description="Categories are soft-deprecated, never deleted — historical disputes keep their reference."
        actions={<CreateCategory onCreated={() => qc.invalidateQueries({ queryKey: ["rc"] })} />}
      />
      <Card className="border">
        <CardContent className="p-0">
          <ul className="divide-y">
            {cats.map((c) => (
              <li key={c.id} className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <div className="text-sm font-medium">{c.name}</div>
                  {c.description && <div className="text-xs text-muted-foreground">{c.description}</div>}
                </div>
                <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                  Active <Switch checked={c.is_active} onCheckedChange={(v) => toggle.mutate({ id: c.id, on: v })} />
                </Label>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </PageBody>
  );
}

function CreateCategory({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const m = useMutation({
    mutationFn: () => categoriesApi.create({ name, description, is_active: true }),
    onSuccess: () => { setOpen(false); setName(""); setDescription(""); onCreated(); toast.success("Category added"); },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="size-3.5" /> New category</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New rejection category</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Description</Label><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => m.mutate()} disabled={!name || m.isPending}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
