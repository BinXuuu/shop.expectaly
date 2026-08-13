import { type TextareaHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, id, label, description, error, required, rows = 4, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const descriptionId = description ? `${textareaId}-description` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-ink text-sm font-medium">
          {label}
          {required && (
            <span aria-hidden="true" className="text-danger-900">
              {" "}
              *
            </span>
          )}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={cn(descriptionId, errorId) || undefined}
        className={cn(
          "focus-ring border-line-strong bg-surface text-ink placeholder:text-ink-faint resize-y rounded-sm border px-3 py-2 text-sm",
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
