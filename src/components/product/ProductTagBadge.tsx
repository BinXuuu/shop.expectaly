import type { ProductTagKey } from "@/types";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

const TAG_CONFIG: Record<ProductTagKey, { label: string; tone: BadgeTone }> = {
  italy_in_stock: { label: "意大利现货", tone: "neutral" },
  domestic_in_stock: { label: "国内现货", tone: "neutral" },
  preorder: { label: "预订", tone: "accent" },
  daigou: { label: "代购", tone: "accent" },
  group_buy: { label: "拼单", tone: "accent" },
  inquiry_only: { label: "询价", tone: "neutral" },
  limited: { label: "限量", tone: "emphasis" },
  exclusive: { label: "独家", tone: "emphasis" },
  arriving_soon: { label: "即将到货", tone: "neutral" },
  sold_out: { label: "已售罄", tone: "muted" },
};

export interface ProductTagBadgeProps {
  tagKey: ProductTagKey;
  className?: string;
}

/** 商品交易标签徽章：与商品分类分开展示，一个商品可叠加多个标签。 */
export function ProductTagBadge({ tagKey, className }: ProductTagBadgeProps) {
  const config = TAG_CONFIG[tagKey];
  return (
    <Badge tone={config.tone} className={className}>
      {config.label}
    </Badge>
  );
}
