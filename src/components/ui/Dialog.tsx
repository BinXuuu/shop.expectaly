"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * 基于原生 <dialog> 元素封装的模态弹层：浏览器原生提供焦点锁定与 Esc 关闭，
 * 无需额外的对话框库即可满足无障碍要求。
 */
export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) {
      node.showModal();
    } else if (!open && node.open) {
      node.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-labelledby="dialog-title"
      aria-describedby={description ? "dialog-description" : undefined}
      className={cn(
        "border-line bg-surface shadow-overlay backdrop:bg-ink/40 m-auto w-[min(560px,calc(100vw-2rem))] rounded-md border p-0",
        className,
      )}
    >
      <div className="border-line flex items-start justify-between gap-4 border-b px-6 py-4">
        <div>
          <h2 id="dialog-title" className="text-ink text-base font-semibold">
            {title}
          </h2>
          {description && (
            <p id="dialog-description" className="text-ink-muted mt-1 text-sm">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭对话框"
          className="focus-ring text-ink-muted hover:text-ink rounded-xs p-1"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </dialog>
  );
}
