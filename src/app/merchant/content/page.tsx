import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { PublishContentForm } from "@/components/merchant";

export const metadata: Metadata = { title: "内容管理" };

export default function MerchantContentPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">内容管理</h1>
        <p className="text-ink-muted mt-1 text-sm">
          发布采购现场、工坊故事等内容，丰富你的商家主页，建立用户信任。
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-ink text-sm font-semibold">已发布内容</h2>
        <EmptyState title="暂无已发布内容" description="发布你的第一条采购现场动态吧。" />
      </section>

      <section className="flex max-w-xl flex-col gap-4">
        <h2 className="text-ink text-sm font-semibold">发布新内容</h2>
        <PublishContentForm />
      </section>
    </div>
  );
}
