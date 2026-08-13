import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: "2" | "3" | "4";
}

const columnClasses: Record<NonNullable<GridProps["columns"]>, string> = {
  "2": "grid-cols-2 sm:grid-cols-2 lg:grid-cols-2",
  "3": "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3",
  "4": "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
};

/** 商品/品牌/商家网格：移动端 2 列起步，随断点递增，保持清晰网格而非瀑布流。 */
export function Grid({ columns = "4", className, children, ...props }: GridProps) {
  return (
    <div
      className={cn("grid gap-x-4 gap-y-8 sm:gap-x-6", columnClasses[columns], className)}
      {...props}
    >
      {children}
    </div>
  );
}
