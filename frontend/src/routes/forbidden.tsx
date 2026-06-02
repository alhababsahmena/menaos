import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/forbidden")({
  component: Forbidden,
});

function Forbidden() {
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-[color:var(--status-rejected)]/15 text-[color:var(--status-rejected)]">
          <ShieldAlert className="size-5" />
        </div>
        <h1 className="text-xl font-semibold">You don't have access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This page requires a permission your role doesn't have. If you think this is wrong,
          ask an admin to check your role assignment.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild><Link to="/">Go home</Link></Button>
          <Button asChild variant="outline"><Link to="/profile">View profile</Link></Button>
        </div>
      </div>
    </div>
  );
}
