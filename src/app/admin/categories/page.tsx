import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { categoryRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "分类管理" };

export default async function AdminCategoriesPage() {
  const categoriesResult = await categoryRepository.findAll();
  const categories = categoriesResult.ok
    ? [...categoriesResult.data].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">分类管理</h1>
        <p className="text-ink-muted mt-1 text-sm">
          共 {categories.length} 个分类。新增/编辑操作将在接入真实数据库后开放。
        </p>
      </div>

      {categories.length === 0 ? (
        <EmptyState title="暂无分类数据" description="演示数据为空。" />
      ) : (
        <div className="border-line overflow-x-auto rounded-xs border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-ink-muted text-xs">
              <tr>
                <th className="px-4 py-3 font-medium">分类名称</th>
                <th className="px-4 py-3 font-medium">上级分类</th>
                <th className="px-4 py-3 font-medium">排序</th>
                <th className="px-4 py-3 font-medium">可见性</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const parent = category.parentId
                  ? categories.find((c) => c.id === category.parentId)
                  : null;
                return (
                  <tr key={category.id} className="border-line border-t">
                    <td className="text-ink px-4 py-3 font-medium">{category.name["zh-CN"]}</td>
                    <td className="text-ink-muted px-4 py-3">
                      {parent ? parent.name["zh-CN"] : "—"}
                    </td>
                    <td className="text-ink-muted px-4 py-3">{category.sortOrder}</td>
                    <td className="px-4 py-3">
                      <Badge tone={category.isVisible ? "success" : "muted"}>
                        {category.isVisible ? "已上线" : "已隐藏"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
