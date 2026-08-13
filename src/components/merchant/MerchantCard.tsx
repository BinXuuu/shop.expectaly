import Link from "next/link";
import { Star } from "lucide-react";
import type { Merchant, MerchantVerificationLevel } from "@/types";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";

const VERIFICATION_LABELS: Record<MerchantVerificationLevel, string> = {
  individual_verified: "个人认证",
  company_verified: "企业认证",
  italy_local_verified: "意大利本地认证",
  platform_partner: "平台合作商家",
  platform_owned: "平台自营",
};

export interface MerchantCardProps {
  merchant: Merchant;
  className?: string;
}

/** 商家卡片：更像品牌档案而非店铺列表项，突出认证信息与所在城市。 */
export function MerchantCard({ merchant, className }: MerchantCardProps) {
  return (
    <Link
      href={`/merchants/${merchant.slug}`}
      className={cn(
        "focus-ring group border-line bg-surface flex items-center gap-4 rounded-xs border p-4",
        className,
      )}
    >
      <PlaceholderImage
        label={merchant.name["zh-CN"]}
        aspect="square"
        className="h-16 w-16 shrink-0 rounded-xs"
      />
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="text-ink group-hover:text-brand-700 truncate text-sm font-semibold">
          {merchant.name["zh-CN"]}
        </h2>
        <span className="text-ink-muted text-xs">{merchant.city}</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {merchant.verificationLevels.slice(0, 2).map((level) => (
            <Badge key={level} tone="accent">
              {VERIFICATION_LABELS[level]}
            </Badge>
          ))}
        </div>
        <div className="text-ink-muted flex items-center gap-1 text-xs">
          <Star aria-hidden="true" className="text-warning-900 h-3.5 w-3.5 fill-current" />
          {merchant.ratingAverage.toFixed(1)}（{merchant.ratingCount}）
        </div>
      </div>
    </Link>
  );
}
