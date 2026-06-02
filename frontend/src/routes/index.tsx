import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { session, isLoading } = useSession();
  if (isLoading) return null;
  if (!session) return <Navigate to="/login" />;
  const dest = session.dashboards[0]?.path ?? "/profile";
  return <Navigate to={dest} />;
}
