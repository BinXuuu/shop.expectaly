import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/shared";
import { contentPageRepository } from "@/lib/repositories";

export async function generateMetadata(): Promise<Metadata> {
  const result = await contentPageRepository.findBySlug("platform-intro");
  return {
    title: result.ok && result.data ? result.data.title["zh-CN"] : "平台介绍",
    description: result.ok ? (result.data?.seoDescription ?? undefined) : undefined,
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  const result = await contentPageRepository.findBySlug("platform-intro");
  if (!result.ok || !result.data) {
    notFound();
  }
  const page = result.data;

  return (
    <PageContainer className="max-w-3xl py-12">
      <h1 className="text-ink font-serif text-3xl font-semibold">{page.title["zh-CN"]}</h1>
      <p className="text-ink-muted mt-6 text-base leading-8">{page.body["zh-CN"]}</p>
    </PageContainer>
  );
}
