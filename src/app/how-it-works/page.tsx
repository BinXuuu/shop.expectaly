import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/shared";
import { contentPageRepository } from "@/lib/repositories";

export async function generateMetadata(): Promise<Metadata> {
  const result = await contentPageRepository.findBySlug("how-it-works");
  return {
    title: result.ok && result.data ? result.data.title["zh-CN"] : "代购流程说明",
    description: result.ok ? (result.data?.seoDescription ?? undefined) : undefined,
    alternates: { canonical: "/how-it-works" },
  };
}

const STEPS = [
  { title: "浏览或提交需求", description: "浏览商品发现页，或在自定义代购页提交你想找的商品。" },
  {
    title: "联系商家或发起询价",
    description: "通过站内询价、微信或联系方式与商家沟通规格与价格。",
  },
  { title: "协商价格与交付方式", description: "确认商品价格、运费、税费与交付时间，达成一致。" },
  {
    title: "自主交易或平台交易",
    description: "多数商品为自主交易，由用户与商家自行完成；支持平台担保的商品将逐步开放站内交易。",
  },
];

export default async function HowItWorksPage() {
  const result = await contentPageRepository.findBySlug("how-it-works");
  if (!result.ok || !result.data) {
    notFound();
  }
  const page = result.data;

  return (
    <PageContainer className="max-w-3xl py-12">
      <h1 className="text-ink font-serif text-3xl font-semibold">{page.title["zh-CN"]}</h1>
      <p className="text-ink-muted mt-6 text-base leading-8">{page.body["zh-CN"]}</p>

      <ol className="mt-10 flex flex-col gap-6">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span className="border-brand-200 text-brand-700 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-serif text-sm font-semibold">
              {index + 1}
            </span>
            <div>
              <h2 className="text-ink text-sm font-semibold">{step.title}</h2>
              <p className="text-ink-muted mt-1 text-sm">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="border-line bg-surface-muted text-ink-muted mt-10 rounded-xs border p-5 text-sm">
        更多风险与费用提示请参阅
        <Link href="/legal/self-negotiated-disclaimer" className="text-brand-700 underline">
          自主交易免责声明
        </Link>
        与
        <Link href="/legal/platform-transaction-rules" className="text-brand-700 underline">
          平台交易规则
        </Link>
        。
      </div>
    </PageContainer>
  );
}
