import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { editorialCollectionRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "专题管理" };

export default async function AdminEditorialPage() {
  const collectionsResult = await editorialCollectionRepository.findAll();
  const collections = collectionsResult.ok
    ? [...collectionsResult.data].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">专题管理</h1>
        <p className="text-ink-muted mt-1 text-sm">
          共 {collections.length} 个专题策展。新增/编辑操作将在接入真实数据库后开放。
        </p>
      </div>

      {collections.length === 0 ? (
        <EmptyState title="暂无专题数据" description="演示数据为空。" />
      ) : (
        <div className="flex flex-col gap-3">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="border-line flex flex-wrap items-center justify-between gap-3 rounded-xs border p-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-ink text-sm font-medium">{collection.title["zh-CN"]}</span>
                  <Badge tone={collection.status === "published" ? "success" : "neutral"}>
                    {collection.status === "published" ? "已发布" : "草稿"}
                  </Badge>
                  {collection.isFeatured && <Badge tone="accent">精选</Badge>}
                </div>
                {collection.description && (
                  <p className="text-ink-muted mt-1 text-xs">{collection.description["zh-CN"]}</p>
                )}
              </div>
              {collection.status === "published" && (
                <Link
                  href={`/editorial/${collection.slug}`}
                  className="focus-ring text-brand-700 text-xs underline"
                >
                  查看专题页
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
