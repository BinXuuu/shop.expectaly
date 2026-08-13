import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
}

/** 页面级容器：统一最大宽度与左右留白，供各页面主体内容使用。 */
export function PageContainer({
  as: Component = "div",
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <Component
      className={cn("mx-auto w-full max-w-(--container-page) px-4 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
