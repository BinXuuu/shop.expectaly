import type { Metadata } from "next";
import { FaqAccordion, PageContainer } from "@/components/shared";
import { faqRepository } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "常见问题",
  description: "关于平台定位、交易方式、支付说明与受限制商品的常见问题解答。",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const faqsResult = await faqRepository.findVisible();
  const faqs = faqsResult.ok ? faqsResult.data : [];

  const groups = faqs.reduce<Record<string, typeof faqs>>((acc, faq) => {
    acc[faq.category] = acc[faq.category] ? [...acc[faq.category], faq] : [faq];
    return acc;
  }, {});

  return (
    <PageContainer className="max-w-3xl py-12">
      <h1 className="text-ink font-serif text-3xl font-semibold">常见问题</h1>
      <div className="mt-8 flex flex-col gap-10">
        {Object.entries(groups).map(([category, items]) => (
          <section key={category}>
            <h2 className="text-brand-700 text-sm font-semibold">{category}</h2>
            <div className="mt-2">
              <FaqAccordion faqs={items} />
            </div>
          </section>
        ))}
      </div>
    </PageContainer>
  );
}
