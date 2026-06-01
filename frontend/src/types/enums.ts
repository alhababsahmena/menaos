/**
 * String unions for every closed enumeration in the domain. Kept as unions
 * (not TypeScript `enum`) so they serialize as their literal value and match
 * exactly what the Postgres `CHECK` constraints accept.
 */

export type TaskStatus = 'pending' | 'accepted' | 'rejected' | 'escalated'

export type AvailabilityStatus = 'active' | 'absent' | 'blocked'

export type LeadDecision = 'pending' | 'rejected' | 'escalated'

export type DisputeOutcome = 'pending' | 'won' | 'lost'

export type Currency = 'JOD' | 'USD'
