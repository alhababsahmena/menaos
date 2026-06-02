import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAvatar } from "@/components/user-avatar";
import { useSession } from "@/lib/session";
import { db } from "@/mocks/db";
import { fullName } from "@/lib/format";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · MENAOS" }] }),
  component: LoginPage,
});

// Suggested role demo users
const DEMO_USERS: { roleLabel: string; userId: string }[] = [
  { roleLabel: "Staff", userId: "u-layla" },
  { roleLabel: "Team Lead", userId: "u-tariq" },
  { roleLabel: "Admin", userId: "u-rania" },
  { roleLabel: "Management", userId: "u-fadi" },
];

function LoginPage() {
  const { session, signIn, isLoading } = useSession();
  const navigate = useNavigate();
  const [pending, setPending] = useState<string | null>(null);

  if (!isLoading && session) return <Navigate to="/" />;

  const handle = async (userId: string) => {
    setPending(userId);
    try {
      const s = await signIn(userId);
      toast.success(`Signed in as ${fullName(s.user)}`);
      navigate({ to: s.dashboards[0]?.path ?? "/profile" });
    } catch (e) {
      toast.error("Sign-in failed");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-4 py-10">
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><BrandMark /></div>

        <Card className="border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Sign in</CardTitle>
            <p className="text-xs text-muted-foreground">
              MENAOS uses Microsoft Entra. Sessions are matched on your Entra object ID.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              size="lg"
              className="w-full justify-center gap-2"
              onClick={() => handle("u-layla")}
              disabled={pending != null}
            >
              <MicrosoftIcon />
              Sign in with Microsoft
            </Button>

            <Separator />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Dev role switcher
                </span>
                <span className="text-[10px] text-muted-foreground">mock SSO</span>
              </div>
              <div className="grid gap-2">
                {DEMO_USERS.map((d) => {
                  const u = db.users.find((x) => x.id === d.userId)!;
                  return (
                    <button
                      key={d.userId}
                      type="button"
                      disabled={pending != null}
                      onClick={() => handle(d.userId)}
                      className="flex items-center gap-3 rounded-md border p-2.5 text-left transition hover:border-primary/40 hover:bg-accent/50 disabled:opacity-60"
                    >
                      <UserAvatar name={fullName(u)} photoUrl={u.photo_url} size="md" />
                      <div className="flex-1 leading-tight">
                        <div className="text-sm font-medium">{fullName(u)}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {d.roleLabel} · {u.email}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {pending === d.userId ? "…" : "→"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Frontend-only build · static mock data · v0.1
        </p>
      </div>
    </div>
  );
}

function MicrosoftIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 23 23" className="size-4">
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#7fba00" d="M12 1h10v10H12z" />
      <path fill="#00a4ef" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  );
}
