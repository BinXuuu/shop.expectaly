import { notFound, redirect } from "next/navigation";
import { categoryRepository } from "@/lib/repositories";

/**
 * 分类页复用商品发现页的筛选与展示逻辑，仅预置分类筛选条件，
 * 避免维护两套并行的商品列表 UI。
 */
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categoryResult = await categoryRepository.findBySlug(slug);

  if (!categoryResult.ok || !categoryResult.data) {
    notFound();
  }

  redirect(`/discover?category=${slug}`);
}
