import Link from "next/link";
import type { Metadata } from "next";
import { PageContainer, Grid, PlaceholderImage } from "@/components/shared";
import { editorialCollectionRepository } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "专题策展",
  description: "编辑精选的主题策展专题，涵盖城市、品牌与收藏方向。",
  alternates: { canonical: "/editorial" },
};

export default async function EditorialListPage() {
  const collectionsResult = await editorialCollectionRepository.findAll();
  const collections = collectionsResult.ok
    ? [...collectionsResult.data]
        .filter((c) => c.status === "published")
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  return (
    <PageContainer className="flex flex-col gap-8 py-10">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">专题策展</h1>
        <p className="text-ink-muted mt-2 max-w-2xl text-sm">编辑团队按主题整理的精选内容。</p>
      </div>
      <Grid columns="3">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/editorial/${collection.slug}`}
            className="focus-ring group flex flex-col rounded-xs"
          >
            <div className="border-line overflow-hidden rounded-xs border">
              <PlaceholderImage label={collection.title["zh-CN"]} aspect="landscape" />
            </div>
            <h2 className="text-ink group-hover:text-brand-700 mt-3 font-serif text-lg font-semibold">
              {collection.title["zh-CN"]}
            </h2>
            {collection.description && (
              <p className="text-ink-muted mt-1 line-clamp-2 text-sm">
                {collection.description["zh-CN"]}
              </p>
            )}
          </Link>
        ))}
      </Grid>
    </PageContainer>
  );
}
