"use client";

import { type ReactNode, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";

export interface MobileFilterDrawerProps {
  children: ReactNode;
  resultCount?: number;
}

/** 移动端筛选抽屉：触发按钮 + Drawer 容器，具体筛选表单由父组件（服务端渲染）作为 children 传入。 */
export function MobileFilterDrawer({ children, resultCount }: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)} className="w-full">
        <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
        筛选{typeof resultCount === "number" ? `（${resultCount} 件结果）` : ""}
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="筛选" side="bottom">
        {children}
      </Drawer>
    </div>
  );
}
