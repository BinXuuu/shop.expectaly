import { cn } from "@/lib/utils/cn";

export interface SkeletonProps {
  className?: string;
}

/** 骨架屏基础色块，遵循 prefers-reduced-motion（见 globals.css 全局降级）。 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("bg-surface-muted animate-pulse rounded-xs", className)}
    />
  );
}

/** 商品卡片骨架，尺寸与 ProductCard 保持一致，避免加载完成后出现布局跳动。 */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-square w-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
