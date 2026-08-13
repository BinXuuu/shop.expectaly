import { type SelectHTMLAttributes, forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  description?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

/** 基于原生 <select> 封装，保证键盘操作与屏幕阅读器兼容性。 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, id, label, description, error, required, options, placeholder, ...props },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const descriptionId = description ? `${selectId}-description` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-ink text-sm font-medium">
          {label}
          {required && (
            <span aria-hidden="true" className="text-danger-900">
              {" "}
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={cn(descriptionId, errorId) || undefined}
          className={cn(
            "focus-ring border-line-strong bg-surface text-ink h-10 w-full appearance-none rounded-sm border px-3 pr-9 text-sm",
            "disabled:bg-surface-muted disabled:text-ink-faint disabled:cursor-not-allowed",
            error && "border-danger-900",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="text-ink-muted pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
        />
      </div>
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
