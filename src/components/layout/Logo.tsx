import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export interface LogoProps {
  className?: string;
}

/**
 * 文字版 Logo 占位。中文主名使用衬线字体强调精品感，
 * 英文品牌名作为小字副标，正式视觉识别（图形 Logo）留待品牌设计阶段替换。
 */
export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("focus-ring flex shrink-0 flex-col rounded-xs leading-none", className)}
    >
      <span className="text-ink font-serif text-lg font-semibold tracking-tight">
        意料之中～意购
      </span>
      <span className="text-ink-muted mt-0.5 text-[10px] tracking-[0.2em] uppercase">
        Expectaly Shop
      </span>
    </Link>
  );
}
