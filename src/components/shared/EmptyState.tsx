import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** 统一空状态：列表/搜索结果为空、筛选无结果等场景复用。 */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-line flex flex-col items-center gap-3 rounded-xs border border-dashed px-6 py-16 text-center",
        className,
      )}
    >
      <span aria-hidden="true" className="text-ink-faint">
        {icon ?? <Inbox className="h-8 w-8" />}
      </span>
      <h3 className="text-ink text-sm font-medium">{title}</h3>
      {description && <p className="text-ink-muted max-w-sm text-sm">{description}</p>}
      {action}
    </div>
  );
}
