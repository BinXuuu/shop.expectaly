import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { ApplicationReviewDialog } from "@/components/admin/ApplicationReviewDialog";
import { merchantApplicationRepository } from "@/lib/repositories";
import {
  getMerchantApplicationStatusLabel,
  getMerchantApplicationStatusTone,
} from "@/lib/services/merchant-application-view";

export const metadata: Metadata = { title: "商家审核" };

export default async function AdminMerchantApplicationsPage() {
  const applicationsResult = await merchantApplicationRepository.findAll();
  const applications = applicationsResult.ok
    ? [...applicationsResult.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];

  const pending = applications.filter((a) => a.status === "submitted" || a.status === "in_review");
  const others = applications.filter((a) => a.status !== "submitted" && a.status !== "in_review");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">商家审核</h1>
        <p className="text-ink-muted mt-1 text-sm">
          共 {applications.length} 条申请，其中 {pending.length} 条待处理。
        </p>
      </div>

      {applications.length === 0 ? (
        <EmptyState title="暂无入驻申请" description="演示数据为空。" />
      ) : (
        <div className="flex flex-col gap-8">
          {pending.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-ink text-sm font-semibold">待处理</h2>
              {pending.map((application) => (
                <div
                  key={application.id}
                  className="border-line flex flex-wrap items-center justify-between gap-3 rounded-xs border p-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-ink text-sm font-medium">{application.legalName}</span>
                      <Badge tone={getMerchantApplicationStatusTone(application.status)}>
                        {getMerchantApplicationStatusLabel(application.status)}
                      </Badge>
                    </div>
                    <p className="text-ink-muted mt-1 text-xs">
                      {application.city}，{application.country} ·{" "}
                      {application.merchantType === "company" ? "企业主体" : "个人买手"}
                    </p>
                    <p className="text-ink-faint mt-1 text-xs">
                      提交时间：{new Date(application.createdAt).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                  <ApplicationReviewDialog
                    title="商家入驻审核"
                    subject={`${application.legalName} · ${application.city}`}
                  />
                </div>
              ))}
            </section>
          )}

          {others.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-ink text-sm font-semibold">历史记录</h2>
              {others.map((application) => (
                <div
                  key={application.id}
                  className="border-line flex flex-wrap items-center justify-between gap-3 rounded-xs border p-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-ink text-sm font-medium">{application.legalName}</span>
                      <Badge tone={getMerchantApplicationStatusTone(application.status)}>
                        {getMerchantApplicationStatusLabel(application.status)}
                      </Badge>
                    </div>
                    {application.reviewNote && (
                      <p className="text-ink-muted mt-1 text-xs">
                        审核意见：{application.reviewNote}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
