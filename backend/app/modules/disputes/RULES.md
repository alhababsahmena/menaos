# Dispute chain — service contract

Models in this module are **data + invariants only**. The state machine below is
the contract the **service batch** implements (it is *not* implemented yet). It
mirrors `dispute_chain_rule` and `pricing_rule` in `docs/schema.v1.1.dbml`.

## One-shot chain (drives `tasks.status`)

```
task.status = rejected
  └─ 1 rejection                      (only creatable when task.status = 'rejected')
       └─ at most 1 counter_argument
            lead_decision: pending ──▶ { rejected | escalated }
              • rejected   → dispute invalid. TERMINAL. No platform_dispute row.
                             task.status stays 'rejected'.
              • escalated  → TL accepted; sends to client MANUALLY.
                             task.status → 'escalated'; tasks.escalated_at set;
                             1 platform_dispute row created (outcome 'pending').
                   └─ 1 platform_dispute
                        outcome: pending ──▶ { won | lost }
                          • won  → task.status → 'accepted'.   (TERMINAL)
                          • lost → task.status stays 'rejected'. (TERMINAL)
```

Round-trip: `rejected → escalated → (won ⇒ accepted | lost ⇒ rejected)`.

Each link is strictly **1:1** at the DB level (unique FK + `relationship(uselist=False)`):
`uq_one_rejection_per_task`, `uq_one_counter_per_rejection`, `uq_one_dispute_per_counter`.

## Enforcement layers

1. **Service layer (primary):** the dispute-resolution action performs every
   status transition, sets `escalated_at` / `decided_at` / `resolved_at`, and
   creates the next chain row — all inside one transaction.
2. **Optimistic lock (`version_id_col` on `tasks.version`):** every
   status-affecting write goes through the ORM, which bumps `version` and raises
   `StaleDataError` if the row changed underneath it. The app maps that to
   `ConflictError` → **HTTP 409** (SPA must invalidate + refetch). Prevents two
   TLs clobbering the same rejected task.
3. **DB trigger (`trg_rejection_requires_rejected`, defence-in-depth):** a
   `BEFORE INSERT ON rejections` trigger raises unless the parent task's status
   is `'rejected'`. Catches seeders / bulk imports / admin tools that bypass the
   service. Lives in the operations+disputes Alembic revision.

## Earnings round-trip (pricing_rule)

A `won` dispute flips the task to `accepted`, and it then counts toward earnings
**exactly like any normal accept** — its frozen `rate_snapshot` (in the parent
`platform.currency`) is what counts, with no special-casing. Earnings =
`SUM(rate_snapshot)` over accepted tasks, **grouped by `platform.currency`**
(never sum JOD + USD).

## Open assumptions — CONFIRM before implementing the service

1. **`won ⇒ accepted` counts like a normal accept** for earnings (no special
   casing). [DBML marks this an assumption.]
2. **One rejection per task lifetime** (one-shot chain). The schema enforces one
   *row* per task (`uq_one_rejection_per_task`); confirm a task can never be
   re-rejected after the chain terminates (i.e. no second cycle).
