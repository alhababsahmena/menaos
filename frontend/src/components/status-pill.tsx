import { cn } from "@/lib/utils";
import {
  Check,
  Clock,
  X,
  ArrowUpRight,
  Trophy,
  Ban,
  CircleDot,
  CircleSlash,
  type LucideIcon,
} from "lucide-react";

export type TaskStatus = "pending" | "accepted" | "rejected" | "escalated";
export type DisputeOutcome = "pending" | "won" | "lost";
export type CounterDecision = "pending" | "rejected" | "escalated";
export type AvailabilityStatus = "active" | "absent" | "blocked";

export type AnyStatus =
  | TaskStatus
  | DisputeOutcome
  | CounterDecision
  | AvailabilityStatus;

interface PillSpec {
  label: string;
  icon: LucideIcon;
  /** CSS color token name suffix from --status-* */
  tone:
    | "pending"
    | "accepted"
    | "rejected"
    | "escalated"
    | "won"
    | "lost"
    | "active"
    | "absent"
    | "blocked";
}

const SPECS: Record<string, PillSpec> = {
  pending: { label: "Pending", icon: Clock, tone: "pending" },
  accepted: { label: "Accepted", icon: Check, tone: "accepted" },
  rejected: { label: "Rejected", icon: X, tone: "rejected" },
  escalated: { label: "Escalated", icon: ArrowUpRight, tone: "escalated" },
  won: { label: "Won", icon: Trophy, tone: "won" },
  lost: { label: "Lost", icon: Ban, tone: "lost" },
  active: { label: "Active", icon: CircleDot, tone: "active" },
  absent: { label: "Absent", icon: CircleSlash, tone: "absent" },
  blocked: { label: "Blocked", icon: Ban, tone: "blocked" },
};

const TONE_CLASSES: Record<PillSpec["tone"], string> = {
  pending:
    "bg-[color:var(--status-pending)]/12 text-[color:var(--status-pending)] ring-[color:var(--status-pending)]/30",
  accepted:
    "bg-[color:var(--status-accepted)]/12 text-[color:var(--status-accepted)] ring-[color:var(--status-accepted)]/30",
  rejected:
    "bg-[color:var(--status-rejected)]/12 text-[color:var(--status-rejected)] ring-[color:var(--status-rejected)]/30",
  escalated:
    "bg-[color:var(--status-escalated)]/12 text-[color:var(--status-escalated)] ring-[color:var(--status-escalated)]/30",
  won: "bg-[color:var(--status-won)]/12 text-[color:var(--status-won)] ring-[color:var(--status-won)]/30",
  lost: "bg-[color:var(--status-lost)]/12 text-[color:var(--status-lost)] ring-[color:var(--status-lost)]/30",
  active:
    "bg-[color:var(--status-active)]/12 text-[color:var(--status-active)] ring-[color:var(--status-active)]/30",
  absent:
    "bg-[color:var(--status-absent)]/12 text-[color:var(--status-absent)] ring-[color:var(--status-absent)]/30",
  blocked:
    "bg-[color:var(--status-blocked)]/12 text-[color:var(--status-blocked)] ring-[color:var(--status-blocked)]/30",
};

interface StatusPillProps {
  status: AnyStatus;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function StatusPill({ status, label, size = "sm", className }: StatusPillProps) {
  const spec = SPECS[status] ?? SPECS.pending;
  const Icon = spec.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full ring-1 font-medium",
        TONE_CLASSES[spec.tone],
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        className,
      )}
      data-status={status}
      aria-label={label ?? spec.label}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} aria-hidden="true" />
      <span>{label ?? spec.label}</span>
    </span>
  );
}
