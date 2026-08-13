import { type InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
}

/**
 * 统一的文本输入框：内置 label / 说明 / 错误提示，
 * 通过 aria-invalid 与 aria-describedby 将错误信息与输入框关联，满足表单可访问性要求。
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, id, label, description, error, required, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-ink text-sm font-medium">
          {label}
          {required && (
            <span aria-hidden="true" className="text-danger-900">
              {" "}
              *
            </span>
          )}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={cn(descriptionId, errorId) || undefined}
        className={cn(
          "focus-ring border-line-strong bg-surface text-ink placeholder:text-ink-faint h-10 rounded-sm border px-3 text-sm",
          "disabled:bg-surface-muted disabled:text-ink-faint disabled:cursor-not-allowed",
          error && "border-danger-900",
          className,
        )}
        {...props}
      />
      {description && !error && (
        <p id={descriptionId} className="text-ink-muted text-xs">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-danger-900 text-xs">
          {error}
        </p>
      )}
    </div>
  );
});
