"use client";

import { Languages } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const LOCALE_OPTIONS = [
  { value: "zh-CN", label: "简体中文", available: true },
  { value: "it-IT", label: "Italiano（即将支持）", available: false },
  { value: "en-US", label: "English（即将支持）", available: false },
] as const;

export interface LanguageSwitcherProps {
  className?: string;
}

/**
 * 语言切换器占位。第一期仅简体中文可用，意大利语/英语选项禁用展示，
 * 明确「即将支持」而非隐藏入口，为 Stage 03 起接入 next-intl 预留位置。
 */
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  return (
    <label
      className={cn("focus-ring relative inline-flex items-center gap-1.5 rounded-xs", className)}
    >
      <span className="sr-only">切换语言</span>
      <Languages aria-hidden="true" className="text-ink-muted h-4 w-4" />
      <select
        defaultValue="zh-CN"
        className="text-ink-muted cursor-pointer appearance-none bg-transparent pr-1 text-sm focus:outline-none"
        aria-label="切换语言，当前为简体中文"
      >
        {LOCALE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} disabled={!option.available}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
