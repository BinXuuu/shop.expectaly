import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { exchangeRateRepository } from "@/lib/repositories";
import { EXCHANGE_RATE_DISCLAIMER } from "@/data/mock";

export const metadata: Metadata = { title: "汇率设置" };

export default async function AdminExchangeRatesPage() {
  const ratesResult = await exchangeRateRepository.findAll();
  const rates = ratesResult.ok ? ratesResult.data : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">汇率设置</h1>
        <p className="text-ink-muted mt-1 text-sm">
          共 {rates.length} 条汇率记录。编辑写入将在接入真实数据库后开放。
        </p>
      </div>

      {rates.length === 0 ? (
        <EmptyState title="暂无汇率数据" description="演示数据为空。" />
      ) : (
        <>
          <div className="border-line overflow-x-auto rounded-xs border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted text-ink-muted text-xs">
                <tr>
                  <th className="px-4 py-3 font-medium">币种对</th>
                  <th className="px-4 py-3 font-medium">汇率</th>
                  <th className="px-4 py-3 font-medium">来源</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">生效时间</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => (
                  <tr key={rate.id} className="border-line border-t">
                    <td className="text-ink px-4 py-3 font-medium">
                      {rate.baseCurrency} → {rate.quoteCurrency}
                    </td>
                    <td className="text-ink-muted px-4 py-3">{rate.rate}</td>
                    <td className="text-ink-muted px-4 py-3">
                      {rate.source === "manual" ? "手动录入" : rate.source}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={rate.isActive ? "success" : "muted"}>
                        {rate.isActive ? "生效中" : "已停用"}
                      </Badge>
                    </td>
                    <td className="text-ink-faint px-4 py-3 text-xs">
                      {new Date(rate.effectiveAt).toLocaleString("zh-CN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-ink-faint text-xs">{EXCHANGE_RATE_DISCLAIMER}</p>
        </>
      )}
    </div>
  );
}
