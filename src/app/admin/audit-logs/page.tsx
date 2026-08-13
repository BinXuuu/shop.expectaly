import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { auditLogRepository } from "@/lib/repositories";
import { ROLE_LABELS } from "@/types";

export const metadata: Metadata = { title: "审计日志" };

export default async function AdminAuditLogsPage() {
  const logsResult = await auditLogRepository.findRecent(100);
  const logs = logsResult.ok ? logsResult.data : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">审计日志</h1>
        <p className="text-ink-muted mt-1 text-sm">
          记录平台后台与商家后台的敏感操作轨迹，共 {logs.length} 条，最新在前。
        </p>
      </div>

      {logs.length === 0 ? (
        <EmptyState title="暂无审计记录" description="演示数据为空。" />
      ) : (
        <div className="border-line overflow-x-auto rounded-xs border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-ink-muted text-xs">
              <tr>
                <th className="px-4 py-3 font-medium">操作</th>
                <th className="px-4 py-3 font-medium">操作人</th>
                <th className="px-4 py-3 font-medium">对象</th>
                <th className="px-4 py-3 font-medium">时间</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-line border-t">
                  <td className="text-ink px-4 py-3 font-medium">
                    <code className="text-xs">{log.action}</code>
                  </td>
                  <td className="text-ink-muted px-4 py-3">
                    {log.actorRole ? (
                      <Badge tone="neutral">{ROLE_LABELS[log.actorRole]}</Badge>
                    ) : (
                      "系统"
                    )}
                  </td>
                  <td className="text-ink-muted px-4 py-3">
                    {log.targetType}
                    {log.targetId ? ` · ${log.targetId}` : ""}
                  </td>
                  <td className="text-ink-faint px-4 py-3 text-xs">
                    {new Date(log.occurredAt).toLocaleString("zh-CN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
