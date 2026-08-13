import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeTone =
  "neutral" | "accent" | "emphasis" | "muted" | "success" | "warning" | "danger";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-line bg-surface-muted text-ink",
  accent: "border-brand-200 bg-brand-50 text-brand-700",
  emphasis: "border-ink bg-ink text-white",
  muted: "border-line bg-surface-muted text-ink-faint",
  success: "border-success-200 bg-success-50 text-success-700",
  warning: "border-warning-200 bg-warning-50 text-warning-900",
  danger: "border-danger-200 bg-danger-50 text-danger-900",
};

/**
 * 通用状态标签：商品交易标签（现货/预订/限量等）与语义状态（已核实/需核对/高风险等）共用同一组件，
 * 通过 tone 区分视觉，不使用大面积醒目色块。
 */
export function Badge({ tone = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-xs border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
