import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRequiredSession, useSession } from "@/lib/session";
import { fullName } from "@/lib/format";
import { toast } from "sonner";
import { usersApi } from "@/services/api";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const session = useRequiredSession();
  const { refresh, signOut } = useSession();
  const [first, setFirst] = useState(session.user.first_name);
  const [last, setLast] = useState(session.user.last_name);

  const save = async () => {
    await usersApi.update(session.user.id, { first_name: first, last_name: last });
    await refresh();
    toast.success("Profile updated");
  };

  return (
    <PageBody>
      <PageHeader title="Profile" description="Entra owns some of this — those fields are read-only." />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <Card className="border">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <UserAvatar name={fullName(session.user)} photoUrl={session.user.photo_url} size="lg" />
            <div>
              <div className="font-semibold">{fullName(session.user)}</div>
              <div className="text-xs text-muted-foreground">{session.user.email}</div>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {session.roles.map((r) => (
                <span key={r.id} className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{r.name}</span>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader><CardTitle className="text-sm">Editable fields</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>First name</Label>
                <Input value={first} onChange={(e) => setFirst(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Last name</Label>
                <Input value={last} onChange={(e) => setLast(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email (Entra-owned)</Label>
              <Input value={session.user.email} disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Entra object ID (Entra-owned)</Label>
              <Input value={session.user.entra_object_id} disabled className="font-mono text-xs" />
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2">
                <Label className="text-xs">Theme</Label>
                <ThemeToggle />
              </div>
              <Button onClick={save}>Save changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageBody>
  );
}
