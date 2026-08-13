import { Check } from "lucide-react";
import type { PurchaseProgress, PurchaseProgressStage } from "@/types";
import { cn } from "@/lib/utils/cn";

const STAGE_ORDER: PurchaseProgressStage[] = [
  "sourcing_in_italy",
  "sourcing_completed",
  "italy_domestic_shipping",
  "international_shipping",
  "customs_clearance",
  "domestic_delivery",
  "completed",
];

const STAGE_LABELS: Record<PurchaseProgressStage, string> = {
  sourcing_in_italy: "意大利采购中",
  sourcing_completed: "已完成采购",
  italy_domestic_shipping: "意大利境内运输",
  international_shipping: "国际运输",
  customs_clearance: "清关中",
  domestic_delivery: "国内配送",
  completed: "已完成",
};

export interface PurchaseProgressTimelineProps {
  entries: PurchaseProgress[];
}

/** 面向用户展示的代购进度时间线，与系统内部的订单状态审计轨迹（order_status_history）分开呈现。 */
export function PurchaseProgressTimeline({ entries }: PurchaseProgressTimelineProps) {
  const reachedStages = new Set(entries.map((e) => e.stage));
  const latestStage = entries.length > 0 ? entries[entries.length - 1].stage : null;
  const latestIndex = latestStage ? STAGE_ORDER.indexOf(latestStage) : -1;

  return (
    <ol className="flex flex-col gap-0">
      {STAGE_ORDER.map((stage, index) => {
        const entry = entries.find((e) => e.stage === stage);
        const isReached = reachedStages.has(stage) || index <= latestIndex;
        const isLast = index === STAGE_ORDER.length - 1;

        return (
          <li key={stage} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs",
                  isReached
                    ? "border-brand-700 bg-brand-700 text-white"
                    : "border-line-strong text-ink-faint",
                )}
              >
                {isReached ? <Check aria-hidden="true" className="h-3.5 w-3.5" /> : index + 1}
              </span>
              {!isLast && (
                <span
                  className={cn("w-px flex-1", isReached ? "bg-brand-700" : "bg-line")}
                  style={{ minHeight: 24 }}
                />
              )}
            </div>
            <div className="pb-6">
              <p className={cn("text-sm font-medium", isReached ? "text-ink" : "text-ink-faint")}>
                {STAGE_LABELS[stage]}
              </p>
              {entry && (
                <>
                  <p className="text-ink-muted mt-0.5 text-xs">{entry.note}</p>
                  <p className="text-ink-faint mt-0.5 text-xs">
                    {new Date(entry.occurredAt).toLocaleString("zh-CN")}
                  </p>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
