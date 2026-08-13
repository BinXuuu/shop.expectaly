"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type DrawerSide = "left" | "right" | "bottom";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: DrawerSide;
  children: ReactNode;
  className?: string;
}

const sideClasses: Record<DrawerSide, string> = {
  left: "inset-y-0 left-0 h-dvh max-h-none w-[min(320px,85vw)] rounded-none",
  right: "inset-y-0 right-0 h-dvh max-h-none w-[min(320px,85vw)] rounded-none",
  bottom: "inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-md",
};

/**
 * 抽屉式面板：移动端菜单、筛选面板等场景复用。
 * 同样基于原生 <dialog>，通过重置 UA 默认居中样式改为贴边定位，保留原生焦点锁定与 Esc 关闭能力。
 */
export function Drawer({ open, onClose, title, side = "right", children, className }: DrawerProps) {
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
      aria-labelledby="drawer-title"
      className={cn(
        "border-line bg-surface shadow-overlay backdrop:bg-ink/40 fixed m-0 border p-0",
        // `dialog:not([open])` 默认由浏览器 UA 样式设为 display:none，
        // 但作者样式的 display 工具类（如 flex）会覆盖该默认值，导致关闭状态下仍占据布局并拦截指针事件。
        // 因此显式按 open 状态切换 display，而非无条件使用 flex。
        open ? "flex flex-col" : "hidden",
        sideClasses[side],
        className,
      )}
    >
      <div className="border-line flex shrink-0 items-center justify-between gap-4 border-b px-4 py-3">
        <h2 id="drawer-title" className="text-ink text-sm font-semibold">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          className="focus-ring text-ink-muted hover:text-ink rounded-xs p-1"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
    </dialog>
  );
}
