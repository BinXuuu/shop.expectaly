import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

/** 统一错误状态：数据加载失败时展示，提供可选的重试操作。 */
export function ErrorState({
  title = "加载失败",
  description = "请检查网络连接后重试，如果问题持续存在，请稍后再试。",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "border-danger-200 bg-danger-50 flex flex-col items-center gap-3 rounded-xs border px-6 py-16 text-center",
        className,
      )}
    >
      <AlertTriangle aria-hidden="true" className="text-danger-900 h-8 w-8" />
      <h3 className="text-ink text-sm font-medium">{title}</h3>
      <p className="text-ink-muted max-w-sm text-sm">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          重新加载
        </Button>
      )}
    </div>
  );
}
