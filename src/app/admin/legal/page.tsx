import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { legalDocumentRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "法律文本" };

export default async function AdminLegalPage() {
  const documentsResult = await legalDocumentRepository.findAll();
  const documents = documentsResult.ok
    ? [...documentsResult.data].sort((a, b) => a.slug.localeCompare(b.slug))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">法律文本</h1>
        <p className="text-ink-muted mt-1 text-sm">
          共 {documents.length} 篇法律文本。正式上线前均须经法律顾问审核。
        </p>
      </div>

      {documents.length === 0 ? (
        <EmptyState title="暂无法律文本数据" description="演示数据为空。" />
      ) : (
        <div className="flex flex-col gap-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="border-line flex flex-wrap items-center justify-between gap-3 rounded-xs border p-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-ink text-sm font-medium">{doc.title["zh-CN"]}</span>
                  <span className="text-ink-faint text-xs">版本 {doc.version}</span>
                  {doc.isPendingLegalReview && <Badge tone="warning">待法律顾问审核</Badge>}
                </div>
                <p className="text-ink-faint mt-1 text-xs">
                  生效时间：{new Date(doc.effectiveAt).toLocaleDateString("zh-CN")}
                </p>
              </div>
              <Link
                href={`/legal/${doc.slug}`}
                className="focus-ring text-brand-700 text-xs underline"
              >
                查看文本
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
