import type { Metadata } from "next";
import { CustomPurchaseForm, PageContainer } from "@/components/shared";

export const metadata: Metadata = {
  title: "自定义代购",
  description: "提交你想寻找的意大利商品，平台与认证商家将协助为你寻找同款或类似款。",
  alternates: { canonical: "/custom-purchase" },
};

export default function CustomPurchasePage() {
  return (
    <PageContainer className="flex max-w-3xl flex-col gap-8 py-10">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">自定义代购</h1>
        <p className="text-ink-muted mt-2 text-sm">
          没有在平台上找到想要的商品？提交商品名称、参考链接或截图，平台自营团队与认证商家将协助为你寻找同款或类似款。
        </p>
      </div>
      <CustomPurchaseForm />
    </PageContainer>
  );
}
