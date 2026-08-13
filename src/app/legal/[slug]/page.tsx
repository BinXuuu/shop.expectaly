import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { PageContainer } from "@/components/shared";
import { legalDocumentRepository } from "@/lib/repositories";
import type { LegalDocumentSlug } from "@/types";
import { mockLegalDocuments } from "@/data/mock";

interface LegalPageProps {
  params: Promise<{ slug: string }>;
}

function isLegalSlug(slug: string): slug is LegalDocumentSlug {
  return mockLegalDocuments.some((doc) => doc.slug === slug);
}

export async function generateStaticParams() {
  return mockLegalDocuments.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isLegalSlug(slug)) {
    return { title: "页面不存在" };
  }
  const result = await legalDocumentRepository.findBySlug(slug);
  return {
    title: result.ok && result.data ? result.data.title["zh-CN"] : "法律文本",
    robots: { index: false, follow: true },
    alternates: { canonical: `/legal/${slug}` },
  };
}

export default async function LegalDocumentPage({ params }: LegalPageProps) {
  const { slug } = await params;

  if (!isLegalSlug(slug)) {
    notFound();
  }

  const result = await legalDocumentRepository.findBySlug(slug);
  if (!result.ok || !result.data) {
    notFound();
  }

  const document = result.data;

  return (
    <PageContainer className="max-w-3xl py-12">
      {document.isPendingLegalReview && (
        <div className="border-warning-200 bg-warning-50 mb-8 flex items-start gap-3 rounded-xs border p-4">
          <AlertTriangle aria-hidden="true" className="text-warning-900 mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-ink-muted text-xs leading-5">
            本文档为初始模板，尚未经过法律顾问审核，不构成正式法律意见。正式发布前将由法务团队审阅并替换为最终文本。
          </p>
        </div>
      )}
      <h1 className="text-ink font-serif text-3xl font-semibold">{document.title["zh-CN"]}</h1>
      <p className="text-ink-faint mt-2 text-xs">
        版本 {document.version} · 生效日期{" "}
        {new Date(document.effectiveAt).toLocaleDateString("zh-CN")}
      </p>
      <p className="text-ink-muted mt-8 text-sm leading-8 whitespace-pre-line">
        {document.body["zh-CN"]}
      </p>
    </PageContainer>
  );
}
