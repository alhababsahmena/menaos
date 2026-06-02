/**
 * Service-layer switch.
 * Components import from "@/services/api" — never from "@/mocks/*".
 *
 * Toggle: VITE_USE_MOCKS=false targets the real DRF backend (see real.ts).
 * Default is true.
 */
import * as mock from "./mock";
import * as real from "./real";

const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? "true") !== "false";

const impl = USE_MOCKS ? mock : (real as unknown as typeof mock);

export const authApi = impl.authApi;
export const usersApi = impl.usersApi;
export const rolesApi = impl.rolesApi;
export const platformsApi = impl.platformsApi;
export const projectsApi = impl.projectsApi;
export const categoriesApi = impl.categoriesApi;
export const availabilityApi = impl.availabilityApi;
export const tasksApi = impl.tasksApi;
export const disputesApi = impl.disputesApi;
export const financialsApi = impl.financialsApi;

export { ConflictError, NotFoundError, ValidationError, ForbiddenError } from "./errors";
export { USE_MOCKS };
