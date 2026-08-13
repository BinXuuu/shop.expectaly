import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}

/** 编辑式内容分区标题：小标签 + 标题 + 可选说明与「查看全部」链接。 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "查看全部",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && <p className="text-brand-700 text-xs tracking-[0.2em] uppercase">{eyebrow}</p>}
        <h2 className="text-ink mt-1 font-serif text-2xl font-semibold">{title}</h2>
        {description && <p className="text-ink-muted mt-2 max-w-2xl text-sm">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="focus-ring text-ink-muted hover:text-brand-700 inline-flex shrink-0 items-center gap-1 rounded-xs text-sm font-medium"
        >
          {linkLabel}
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
