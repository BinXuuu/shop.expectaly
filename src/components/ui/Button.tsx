import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-700 text-white hover:bg-brand-900 disabled:bg-ink-faint",
  secondary:
    "border border-line-strong bg-surface text-ink hover:border-ink-muted disabled:text-ink-faint",
  ghost: "text-ink hover:bg-surface-muted disabled:text-ink-faint",
  danger: "bg-danger-900 text-white hover:opacity-90 disabled:bg-ink-faint",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

/**
 * 计算按钮视觉样式的类名，供「看起来像按钮的链接」场景使用
 * （如跳转型 CTA），避免把 <a>/<Link> 嵌套进 <button> 造成非法 HTML 结构。
 */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(
    "focus-ring inline-flex shrink-0 items-center justify-center rounded-sm font-medium transition-colors duration-150",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

/**
 * 基础按钮：直角/极小圆角，无胶囊造型，无阴影。
 * 加载态显示旋转指示器并禁用交互，避免重复提交。
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", isLoading = false, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        "focus-ring inline-flex shrink-0 items-center justify-center rounded-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {isLoading && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
});
