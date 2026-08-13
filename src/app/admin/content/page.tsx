import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { contentPageRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "内容管理" };

export default async function AdminContentPage() {
  const pagesResult = await contentPageRepository.findAll();
  const pages = pagesResult.ok
    ? [...pagesResult.data].sort((a, b) => a.slug.localeCompare(b.slug))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">内容管理</h1>
        <p className="text-ink-muted mt-1 text-sm">
          共 {pages.length} 个平台说明内容页。新增/编辑操作将在接入真实数据库后开放。
        </p>
      </div>

      {pages.length === 0 ? (
        <EmptyState title="暂无内容页数据" description="演示数据为空。" />
      ) : (
        <div className="flex flex-col gap-3">
          {pages.map((page) => (
            <div
              key={page.id}
              className="border-line flex flex-wrap items-center justify-between gap-3 rounded-xs border p-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-ink text-sm font-medium">{page.title["zh-CN"]}</span>
                  <Badge tone={page.status === "published" ? "success" : "neutral"}>
                    {page.status === "published" ? "已发布" : "草稿"}
                  </Badge>
                </div>
                <p className="text-ink-faint mt-1 text-xs">/{page.slug}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
