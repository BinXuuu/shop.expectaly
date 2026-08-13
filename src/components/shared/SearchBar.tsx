"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const STORAGE_KEY = "expectaly:recent-searches";
const MAX_RECENT = 8;

export const POPULAR_SEARCHES = [
  "国际米兰",
  "法拉利车模",
  "珐琅耳饰",
  "米兰买手",
  "限量收藏",
  "雪茄",
];

function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeRecentSearches(searches: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch {
    // 本地存储不可用时静默忽略，不影响搜索本身
  }
}

export interface SearchBarProps {
  defaultValue?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({ defaultValue = "", className, autoFocus }: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    // localStorage 只在浏览器可用，此处是服务端渲染后的首次客户端同步（而非派生已有 state），
    // 避免因直接在渲染阶段读取 localStorage 导致的服务端/客户端 hydration 不一致。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(readRecentSearches());
  }, []);

  function submitQuery(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;
    const next = [trimmed, ...recent.filter((item) => item !== trimmed)].slice(0, MAX_RECENT);
    setRecent(next);
    writeRecentSearches(next);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuery(value);
  }

  function clearRecent() {
    setRecent([]);
    writeRecentSearches([]);
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <form onSubmit={handleSubmit} className="flex gap-2" role="search">
        <label htmlFor="search-input" className="sr-only">
          搜索商品、品牌、商家、城市或专题
        </label>
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="text-ink-faint pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          />
          <input
            id="search-input"
            type="search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="搜索商品、品牌、商家、城市或专题"
            autoFocus={autoFocus}
            className="focus-ring border-line-strong bg-surface text-ink h-11 w-full rounded-sm border pr-3 pl-9 text-sm"
          />
        </div>
        <button
          type="submit"
          className="focus-ring bg-brand-700 hover:bg-brand-900 h-11 shrink-0 rounded-sm px-5 text-sm font-medium text-white"
        >
          搜索
        </button>
      </form>

      {recent.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-ink-muted text-xs">最近搜索：</span>
          {recent.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => submitQuery(term)}
              className="focus-ring border-line text-ink-muted hover:border-brand-200 hover:text-brand-700 rounded-xs border px-2.5 py-1 text-xs"
            >
              {term}
            </button>
          ))}
          <button
            type="button"
            onClick={clearRecent}
            aria-label="清除搜索历史"
            className="focus-ring text-ink-faint hover:text-ink-muted"
          >
            <X aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-ink-muted text-xs">热门搜索：</span>
        {POPULAR_SEARCHES.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => submitQuery(term)}
            className="focus-ring border-line text-ink-muted hover:border-brand-200 hover:text-brand-700 rounded-xs border px-2.5 py-1 text-xs"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
