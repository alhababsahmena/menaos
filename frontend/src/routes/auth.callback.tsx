import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useSession } from "@/lib/session";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth/callback")({
  component: Callback,
});

function Callback() {
  const { session, isLoading } = useSession();
  if (isLoading)
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Resolving session…
        </div>
      </div>
    );
  if (!session) return <Navigate to="/login" />;
  return <Navigate to={session.dashboards[0]?.path ?? "/profile"} />;
}
