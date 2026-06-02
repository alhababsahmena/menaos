import type { ReactNode } from "react";
import { useSession } from "@/lib/session";
import type { PermissionKey } from "@/types";

export function usePermissions() {
  const { session } = useSession();
  const keys = new Set<PermissionKey>(session?.permissionKeys ?? []);
  return {
    has: (k: PermissionKey) => keys.has(k),
    hasAny: (...k: PermissionKey[]) => k.some((x) => keys.has(x)),
    hasAll: (...k: PermissionKey[]) => k.every((x) => keys.has(x)),
    all: session?.permissionKeys ?? [],
  };
}

interface CanProps {
  permission?: PermissionKey;
  anyOf?: PermissionKey[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({ permission, anyOf, fallback = null, children }: CanProps) {
  const { has, hasAny } = usePermissions();
  const ok = permission ? has(permission) : anyOf ? hasAny(...anyOf) : true;
  return <>{ok ? children : fallback}</>;
}
