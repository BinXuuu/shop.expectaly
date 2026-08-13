import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { systemSettingRepository } from "@/lib/repositories";
import { getFeatureFlags } from "@/lib/config/feature-flags";

export const metadata: Metadata = { title: "系统设置" };

const FEATURE_FLAG_LABELS: Record<keyof ReturnType<typeof getFeatureFlags>, string> = {
  paymentEnabled: "平台担保交易支付通道",
  wechatLoginEnabled: "微信登录",
  mainSiteSsoEnabled: "主站账号互通（SSO）",
};

export default async function AdminSettingsPage() {
  const flags = getFeatureFlags();
  const settingsResult = await systemSettingRepository.findAll();
  const settings = settingsResult.ok ? settingsResult.data : [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">系统设置</h1>
        <p className="text-ink-muted mt-1 text-sm">
          功能开关按环境变量读取，第一期全部默认关闭；配置项当前为只读展示。
        </p>
      </div>

      <section>
        <h2 className="text-ink mb-3 text-sm font-semibold">功能开关（只读，取自环境变量）</h2>
        <div className="border-line overflow-x-auto rounded-xs border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-ink-muted text-xs">
              <tr>
                <th className="px-4 py-3 font-medium">开关</th>
                <th className="px-4 py-3 font-medium">当前状态</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(flags) as Array<keyof typeof flags>).map((key) => (
                <tr key={key} className="border-line border-t">
                  <td className="text-ink px-4 py-3 font-medium">{FEATURE_FLAG_LABELS[key]}</td>
                  <td className="px-4 py-3">
                    <Badge tone={flags[key] ? "success" : "muted"}>
                      {flags[key] ? "已开启" : "已关闭"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-ink mb-3 text-sm font-semibold">配置项</h2>
        <div className="flex flex-col gap-3">
          {settings.map((setting) => (
            <div key={setting.id} className="border-line rounded-xs border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-ink text-sm font-medium">{setting.key}</span>
                <Badge tone="neutral">{setting.valueType}</Badge>
              </div>
              <p className="text-ink-muted mt-1 text-sm">{setting.value}</p>
              {setting.description && (
                <p className="text-ink-faint mt-1 text-xs">{setting.description}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
