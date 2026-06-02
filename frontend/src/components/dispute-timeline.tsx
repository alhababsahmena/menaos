import { Card, CardContent } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill";
import { formatRelative } from "@/lib/format";
import { ArrowRight, AlertCircle, Gavel, Trophy } from "lucide-react";
import type { CounterArgument, PlatformDispute, Rejection } from "@/types";

interface Props {
  rejection: Rejection;
  counter: CounterArgument | null;
  dispute: PlatformDispute | null;
  categoryName?: string;
}

export function DisputeTimeline({ rejection, counter, dispute, categoryName }: Props) {
  return (
    <Card className="border bg-card">
      <CardContent className="space-y-4 p-5">
        <Step
          icon={<AlertCircle className="size-4" />}
          tone="rejected"
          title="Task rejected"
          when={rejection.rejected_at}
          body={
            <>
              {categoryName && (
                <span className="mr-2 inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                  {categoryName}
                </span>
              )}
              <span className="text-foreground">{rejection.feedback}</span>
            </>
          }
        />

        {counter ? (
          <Step
            icon={<ArrowRight className="size-4" />}
            tone="info"
            title="Counter-argument"
            when={counter.created_at}
            body={<span className="text-foreground">{counter.argument}</span>}
            trailing={
              <StatusPill
                status={counter.lead_decision === "pending" ? "pending" : counter.lead_decision === "escalated" ? "escalated" : "rejected"}
                label={counter.lead_decision === "pending" ? "TL: pending" : counter.lead_decision === "escalated" ? "TL: escalated" : "TL: rejected"}
              />
            }
          />
        ) : (
          <Empty title="No counter-argument yet" hint="The submitter can still respond." />
        )}

        {counter?.lead_decision === "rejected" && (
          <Empty title="Chain ended" hint="Counter rejected by team lead — task remains rejected." />
        )}

        {dispute && (
          <Step
            icon={dispute.outcome === "won" ? <Trophy className="size-4" /> : <Gavel className="size-4" />}
            tone="info"
            title="Platform dispute"
            when={dispute.submitted_at}
            body={<span className="text-muted-foreground">{dispute.platform_notes ?? "Submitted to platform for arbitration."}</span>}
            trailing={<StatusPill status={dispute.outcome} />}
          />
        )}
      </CardContent>
    </Card>
  );
}

function Step({
  icon, tone, title, when, body, trailing,
}: {
  icon: React.ReactNode;
  tone: "rejected" | "info";
  title: string;
  when: string;
  body: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={`grid size-7 shrink-0 place-items-center rounded-full ring-1 ${
          tone === "rejected"
            ? "bg-[color:var(--status-rejected)]/15 text-[color:var(--status-rejected)] ring-[color:var(--status-rejected)]/30"
            : "bg-accent text-accent-foreground ring-border"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{title}</span>
          <span className="text-[11px] text-muted-foreground">· {formatRelative(when)}</span>
          {trailing && <span className="ml-auto">{trailing}</span>}
        </div>
        <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}

function Empty({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-md border border-dashed bg-surface px-3 py-2 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{title}</span> · {hint}
    </div>
  );
}
