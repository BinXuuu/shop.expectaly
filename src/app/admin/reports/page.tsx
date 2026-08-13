import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { ApplicationReviewDialog } from "@/components/admin/ApplicationReviewDialog";
import { profileRepository, reportRepository, systemSettingRepository } from "@/lib/repositories";
import { findRiskKeywordMatches, parseRiskKeywords } from "@/lib/services/compliance-service";
import type { ReportCategory, ReportedEntityType, ReportStatus } from "@/types";

export const metadata: Metadata = { title: "举报处理" };

const CATEGORY_LABELS: Record<ReportCategory, string> = {
  infringement: "侵权内容",
  false_information: "虚假信息",
  restricted_product: "违规商品",
  suspicious_transaction: "可疑交易",
  minor_risk: "未成年人相关风险",
  other: "其他",
};

const REPORTED_TYPE_LABELS: Record<ReportedEntityType, string> = {
  product: "商品",
  merchant: "商家",
  review: "评价",
  content: "内容页",
};

const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "待处理",
  investigating: "调查中",
  resolved: "已处理",
  dismissed: "已驳回",
  removed: "已下架",
  banned: "已封禁",
};

const STATUS_TONES: Record<ReportStatus, BadgeTone> = {
  pending: "warning",
  investigating: "accent",
  resolved: "success",
  dismissed: "muted",
  removed: "danger",
  banned: "danger",
};

export default async function AdminReportsPage() {
  const [reportsResult, profilesResult, riskKeywordsResult] = await Promise.all([
    reportRepository.findAll(),
    profileRepository.findAll(),
    systemSettingRepository.findByKey("risk_keywords"),
  ]);
  const reports = reportsResult.ok
    ? [...reportsResult.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];
  const userNameById = new Map(
    (profilesResult.ok ? profilesResult.data : []).map((p) => [p.id, p.displayName]),
  );
  const riskKeywords =
    riskKeywordsResult.ok && riskKeywordsResult.data
      ? parseRiskKeywords(riskKeywordsResult.data.value)
      : [];

  const open = reports.filter((r) => r.status === "pending" || r.status === "investigating");
  const handled = reports.filter((r) => r.status !== "pending" && r.status !== "investigating");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">举报处理</h1>
        <p className="text-ink-muted mt-1 text-sm">
          共 {reports.length} 条举报，其中 {open.length} 条待处理。
        </p>
      </div>

      {reports.length === 0 ? (
        <EmptyState title="暂无举报记录" description="演示数据为空。" />
      ) : (
        <div className="flex flex-col gap-8">
          {open.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-ink text-sm font-semibold">待处理</h2>
              {open.map((report) => {
                const riskMatches = findRiskKeywordMatches(report.description, riskKeywords);
                return (
                  <div
                    key={report.id}
                    className="border-line flex flex-wrap items-start justify-between gap-3 rounded-xs border p-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-ink text-sm font-medium">
                          举报「{REPORTED_TYPE_LABELS[report.reportedType]}」
                        </span>
                        <Badge tone="neutral">{CATEGORY_LABELS[report.category]}</Badge>
                        <Badge tone={STATUS_TONES[report.status]}>
                          {STATUS_LABELS[report.status]}
                        </Badge>
                        {riskMatches.length > 0 && (
                          <Badge tone="danger">命中风险关键词：{riskMatches.join("、")}</Badge>
                        )}
                      </div>
                      <p className="text-ink-muted mt-2 max-w-xl text-sm">{report.description}</p>
                      <p className="text-ink-faint mt-2 text-xs">
                        举报人：{userNameById.get(report.reporterId) ?? "—"} ·{" "}
                        {new Date(report.createdAt).toLocaleDateString("zh-CN")}
                      </p>
                    </div>
                    <ApplicationReviewDialog
                      title="举报处理"
                      subject={`${REPORTED_TYPE_LABELS[report.reportedType]} · ${CATEGORY_LABELS[report.category]}`}
                    />
                  </div>
                );
              })}
            </section>
          )}

          {handled.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-ink text-sm font-semibold">已处理</h2>
              {handled.map((report) => (
                <div key={report.id} className="border-line rounded-xs border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-ink text-sm font-medium">
                      举报「{REPORTED_TYPE_LABELS[report.reportedType]}」
                    </span>
                    <Badge tone={STATUS_TONES[report.status]}>{STATUS_LABELS[report.status]}</Badge>
                  </div>
                  {report.resolutionNote && (
                    <p className="text-ink-muted mt-2 text-sm">处理意见：{report.resolutionNote}</p>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
