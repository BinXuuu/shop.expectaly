import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { PageContainer } from "@/components/shared";
import { MerchantNav } from "@/components/merchant";
import { buttonClasses } from "@/components/ui/Button";
import { getCurrentProfile } from "@/lib/auth/session";
import { getManagedMerchant } from "@/lib/services/merchant-context";
import { can } from "@/lib/permissions";

export const metadata: Metadata = {
  title: { default: "商家后台", template: "%s | 商家后台 · 意料之中～意购" },
  robots: { index: false, follow: false },
};

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login?redirect=/merchant");
  }

  const merchant = await getManagedMerchant(profile.id);
  const hasMerchantAccess = can(profile.roles, "product:update_own") && merchant;

  if (!hasMerchantAccess) {
    return (
      <PageContainer className="max-w-xl py-16">
        <h1 className="text-ink font-serif text-2xl font-semibold">你还不是认证商家</h1>
        <p className="text-ink-muted mt-3 text-sm">
          该页面仅面向审核通过的入驻商家开放。如果你已经提交过入驻申请，请留意站内通知获取审核结果；
          如果还没有申请，欢迎先了解入驻流程。
        </p>
        <Link href="/merchant-apply" className={buttonClasses("primary", "md", "mt-6")}>
          了解商家入驻
        </Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="grid gap-8 py-10 lg:grid-cols-[220px_1fr]">
      <aside className="flex flex-col gap-4">
        <div className="border-line rounded-xs border p-4">
          <p className="text-ink text-sm font-semibold">{merchant.name["zh-CN"]}</p>
          <p className="text-ink-muted mt-0.5 text-xs">{merchant.city}</p>
        </div>
        <MerchantNav />
      </aside>
      <div className="min-w-0">{children}</div>
    </PageContainer>
  );
}
