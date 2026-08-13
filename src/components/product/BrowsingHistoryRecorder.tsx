"use client";

import { useEffect } from "react";

const STORAGE_KEY = "expectaly:browsing-history";
const MAX_HISTORY = 30;

export interface BrowsingHistoryEntry {
  productId: string;
  slug: string;
  name: string;
  brandName?: string;
  viewedAt: string;
}

export function readBrowsingHistory(): BrowsingHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BrowsingHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function writeBrowsingHistory(entries: BrowsingHistoryEntry[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // 本地存储不可用时静默忽略
  }
}

export function clearBrowsingHistory(): void {
  writeBrowsingHistory([]);
}

export interface BrowsingHistoryRecorderProps {
  productId: string;
  slug: string;
  name: string;
  brandName?: string;
}

/**
 * 无渲染输出的浏览历史记录器：挂载于商品详情页，将浏览记录写入本地存储。
 * 平台数据库暂无对应实体表（浏览历史第一期为纯前端本地记录，不上传服务端）。
 */
export function BrowsingHistoryRecorder({
  productId,
  slug,
  name,
  brandName,
}: BrowsingHistoryRecorderProps) {
  useEffect(() => {
    const existing = readBrowsingHistory().filter((entry) => entry.productId !== productId);
    const next = [
      { productId, slug, name, brandName, viewedAt: new Date().toISOString() },
      ...existing,
    ].slice(0, MAX_HISTORY);
    writeBrowsingHistory(next);
    // 仅在商品标识变化时重新记录，避免同一页面重复渲染导致的多余写入
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return null;
}
