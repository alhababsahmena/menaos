/**
 * Branded primitives shared across every domain entity. All are aliases over
 * `string` so JSON deserialization is zero-cost — the brand is documentation,
 * not a runtime check.
 *
 * Conventions (locked):
 *
 * - `ID`           — UUIDv4 string. The backend assigns IDs; the SPA only
 *                    forwards them. Never generate IDs client-side.
 * - `ISODateTime`  — RFC 3339 / ISO 8601 in UTC with `Z` suffix,
 *                    e.g. "2026-06-01T11:22:33Z" or "2026-06-01T11:22:33.000Z".
 *                    The backend always emits UTC; the SPA formats for the
 *                    viewer's locale at the edge.
 * - `ISODate`      — Calendar date "YYYY-MM-DD" with no time/timezone, used
 *                    for rate effective windows and report ranges.
 * - `Money`        — String-encoded fixed-point decimal mirroring the
 *                    Postgres `NUMERIC(12,2)` column (e.g. "1234.50").
 *                    Strings preserve precision; do NOT `parseFloat` for
 *                    arithmetic — use the currency helpers in `@lib` (later).
 */

export type ID = string
export type ISODateTime = string
export type ISODate = string
export type Money = string
