import type { OrderStatusHistory } from "@/types";
import { getOrderStatusLabel } from "@/lib/services/order-view";

export interface OrderStatusHistoryListProps {
  entries: OrderStatusHistory[];
}

/** 订单状态审计轨迹：记录任意状态变更，供客服/用户追溯完整流转过程。 */
export function OrderStatusHistoryList({ entries }: OrderStatusHistoryListProps) {
  return (
    <ol className="flex flex-col gap-4">
      {entries.map((entry) => (
        <li key={entry.id} className="border-brand-200 flex flex-col gap-0.5 border-l-2 pl-4">
          <span className="text-ink text-sm font-medium">
            {getOrderStatusLabel(entry.toStatus)}
          </span>
          {entry.note && <span className="text-ink-muted text-xs">{entry.note}</span>}
          <span className="text-ink-faint text-xs">
            {new Date(entry.occurredAt).toLocaleString("zh-CN")}
          </span>
        </li>
      ))}
    </ol>
  );
}
