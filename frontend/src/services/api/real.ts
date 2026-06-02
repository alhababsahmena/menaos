/**
 * REAL API stub. Targets the Django/DRF backend.
 * Every method documents its endpoint. Wire up when backend is ready.
 *
 * Auth: Microsoft Entra OIDC. Axios interceptors attach Bearer access tokens
 * and refresh on 401. 409 responses surface as ConflictError to the UI.
 */
import { ConflictError } from "./errors";

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

// Placeholder client — wire up axios with interceptors when backend is live.
async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 409) throw new ConflictError();
  if (!res.ok) throw new Error(`API ${method} ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

// Each export mirrors the same signature as `mock.ts`. Endpoints below are
// the contract that the Django backend must implement.
//
//  authApi.getSession()                  GET    /auth/session/
//  usersApi.list()                       GET    /users/
//  usersApi.assignRole(uid, rid)         POST   /users/:uid/roles/
//  usersApi.unassignRole(uid, rid)       DELETE /users/:uid/roles/:rid/
//  rolesApi.setPermissions(rid, keys)    PUT    /roles/:rid/permissions/
//  platformsApi.addRate(pid, ...)        POST   /platforms/:pid/rates/
//  projectsApi.assignMember(...)         POST   /projects/:pid/members/
//  tasksApi.list(filters)                GET    /tasks/?...
//  tasksApi.create(input)                POST   /tasks/
//  tasksApi.updateStatus(id, v, status)  POST   /tasks/:id/status/    body { version, status }
//  tasksApi.correct(id, v, patch)        PATCH  /tasks/:id/           body { version, ...patch }
//  tasksApi.approveReview(id, v)         POST   /tasks/:id/review/    body { version }
//  tasksApi.sendBack(id, v, reason)      POST   /tasks/:id/send-back/ body { version, reason }
//  tasksApi.addAttachment(id, file)      POST   /tasks/:id/attachments/  (multipart)
//  availabilityApi.log(...)              POST   /availability/
//  categoriesApi.create(...)             POST   /rejection-categories/
//  disputesApi.logRejection(...)         POST   /disputes/rejections/
//  disputesApi.writeCounter(...)         POST   /disputes/counter-arguments/
//  disputesApi.decideCounter(...)        POST   /disputes/counter-arguments/:id/decide/
//  disputesApi.recordOutcome(...)        POST   /disputes/:id/outcome/
//  financialsApi.earnings(filters)       GET    /financials/earnings/?...
//
// Implementation intentionally omitted — use mockApi until the backend is live.

export function notImplemented(method: string): never {
  throw new Error(`realApi.${method} is not yet implemented. Set VITE_USE_MOCKS=true.`);
}

// All exports mirror mock signatures with a "not implemented" body so TS sees
// the same shape. The bundler picks one or the other at import time.
const stub = new Proxy({} as Record<string, (...args: unknown[]) => unknown>, {
  get(_, prop: string) {
    return () => notImplemented(prop);
  },
});

export const authApi = stub as never;
export const usersApi = stub as never;
export const rolesApi = stub as never;
export const platformsApi = stub as never;
export const projectsApi = stub as never;
export const categoriesApi = stub as never;
export const availabilityApi = stub as never;
export const tasksApi = stub as never;
export const disputesApi = stub as never;
export const financialsApi = stub as never;

// Used by `call` below if/when needed
export { call };
