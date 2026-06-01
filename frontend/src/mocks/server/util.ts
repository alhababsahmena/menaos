import type { ID, Paginated } from '@types'

import { NotFoundError, TransientNetworkError } from '@lib/errors'

import { getMockConfig } from './config'

/**
 * Shared helpers for every mock handler. Each handler is wrapped in
 * `respond()` so it picks up simulated latency / error injection uniformly
 * and so callers always receive a deep clone (no shared references with
 * the in-memory db).
 */

function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function rollLatency(min: number, max: number): number {
  if (max <= 0) return 0
  if (max <= min) return min
  return Math.floor(min + Math.random() * (max - min))
}

/**
 * Wrap a handler body: simulated latency + optional injected transient
 * failure + structuredClone of the result. Use for every public mock
 * method so the contract is uniform.
 */
export async function respond<T>(work: () => T | Promise<T>): Promise<T> {
  const cfg = getMockConfig()
  await sleep(rollLatency(cfg.latencyMinMs, cfg.latencyMaxMs))
  if (cfg.errorRate > 0 && Math.random() < cfg.errorRate) {
    throw new TransientNetworkError()
  }
  const result = await work()
  return structuredClone(result)
}

/**
 * Look up a row by ID; throws `NotFoundError` if missing. Use everywhere
 * the mock dereferences an FK so callers get the same error semantics the
 * real backend will produce.
 */
export function requireById<T extends { id: ID }>(
  rows: readonly T[],
  id: ID,
  entityName: string,
): T {
  const found = rows.find((row) => row.id === id)
  if (!found) {
    throw new NotFoundError(`${entityName} ${id} not found.`)
  }
  return found
}

/**
 * Paginate an in-memory array using the same envelope DRF emits. `next` /
 * `previous` are placeholder URLs (the mock has no real URL space); the
 * SPA only needs them as truthy/falsy markers for pagination controls.
 */
export function paginate<T>(
  rows: readonly T[],
  page: number,
  page_size: number,
  basePath: string,
): Paginated<T> {
  const safePage = Math.max(1, Math.floor(page))
  const safeSize = Math.max(1, Math.floor(page_size))
  const start = (safePage - 1) * safeSize
  const end = start + safeSize
  const slice = rows.slice(start, end)
  const total = rows.length
  const lastPage = Math.max(1, Math.ceil(total / safeSize))
  const next =
    safePage < lastPage
      ? `https://mock-api.local${basePath}?page=${safePage + 1}&page_size=${safeSize}`
      : null
  const previous =
    safePage > 1
      ? `https://mock-api.local${basePath}?page=${safePage - 1}&page_size=${safeSize}`
      : null
  return { results: slice.slice(), count: total, next, previous }
}

/** Current timestamp in the project's ISO 8601 UTC convention. */
export function nowIso(): string {
  return new Date().toISOString()
}

/**
 * Generate a short-lived opaque signed URL for an object-storage key. The
 * format mirrors what the real backend will emit (`mock-storage.local`
 * host, `?sig=…` query) so feature components write the same code today
 * as they will in production.
 */
export function signedUrlFor(fileKey: string): string {
  // Deterministic-ish: hash the key into a short token so the URL changes
  // when the key does. The signature is *not* cryptographic — it's a
  // placeholder so the SPA treats it as opaque.
  let hash = 0
  for (let i = 0; i < fileKey.length; i += 1) {
    hash = (hash * 31 + fileKey.charCodeAt(i)) | 0
  }
  const sig = (hash >>> 0).toString(16).padStart(8, '0')
  return `https://mock-storage.local/signed/${fileKey}?sig=${sig}`
}
