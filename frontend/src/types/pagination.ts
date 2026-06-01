/**
 * Wire-shape envelopes shared across every collection / error response.
 *
 * `Paginated<T>` mirrors DRF's default `PageNumberPagination` output. `next`
 * and `previous` are absolute URLs from the backend, or `null` at the edges.
 */

export interface Paginated<T> {
  results: T[]
  count: number
  next: string | null
  previous: string | null
}

/**
 * Normalized error envelope returned by `lib/apiClient` regardless of
 * transport (mock or axios). `field_errors` is keyed by form field name and
 * holds a list of human messages; absent for non-form errors.
 */
export interface ApiError {
  code: string
  message: string
  status: number
  field_errors: Record<string, string[]> | null
  details: Record<string, unknown> | null
}
