"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/shared";
import {
  clearBrowsingHistory,
  readBrowsingHistory,
  type BrowsingHistoryEntry,
} from "@/components/product/BrowsingHistoryRecorder";

export function BrowsingHistoryList() {
  const [entries, setEntries] = useState<BrowsingHistoryEntry[]>([]);

  useEffect(() => {
    // 浏览历史保存在本机浏览器，服务端渲染时无法读取，此处首次客户端挂载时同步
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(readBrowsingHistory());
  }, []);

  if (entries.length === 0) {
    return (
      <EmptyState title="暂无浏览记录" description="浏览过的商品会记录在这台设备上，方便回顾。" />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clearBrowsingHistory();
            setEntries([]);
          }}
        >
          清空浏览历史
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {entries.map((entry) => (
          <Link
            key={entry.productId}
            href={`/products/${entry.slug}`}
            className="focus-ring border-line hover:border-brand-200 flex items-center justify-between gap-3 rounded-xs border px-4 py-3"
          >
            <div>
              {entry.brandName && (
                <span className="text-ink-muted mr-2 text-xs">{entry.brandName}</span>
              )}
              <span className="text-ink text-sm">{entry.name}</span>
            </div>
            <span className="text-ink-faint text-xs">
              {new Date(entry.viewedAt).toLocaleString("zh-CN")}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
