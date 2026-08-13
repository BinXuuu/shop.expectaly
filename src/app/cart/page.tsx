import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { EmptyState, PageContainer } from "@/components/shared";
import { BatchInquiryDialog, CartLineItem } from "@/components/cart";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { getCurrentProfile } from "@/lib/auth/session";
import { getCartSummary } from "@/lib/services/cart-service";
import { getFeatureFlags, PAYMENT_DISABLED_NOTICE } from "@/lib/config/feature-flags";
import { merchantRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "购物车", robots: { index: false, follow: false } };

export default async function CartPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/auth/login?redirect=/cart");
  }

  const summaryResult = await getCartSummary(profile.id);
  const groups = summaryResult.ok ? summaryResult.data.groups : [];
  const { paymentEnabled } = getFeatureFlags();

  const groupsWithMerchant = await Promise.all(
    groups.map(async (group) => {
      const merchantResult = group.merchantId
        ? await merchantRepository.findById(group.merchantId)
        : null;
      return { ...group, merchant: merchantResult?.ok ? merchantResult.data : null };
    }),
  );

  return (
    <PageContainer className="flex flex-col gap-8 py-10">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">购物车</h1>
        <p className="text-ink-muted mt-1 text-sm">
          不同商家的商品分开结算，暂不支持合并支付；平台担保交易正在逐步开放。
        </p>
      </div>

      {groupsWithMerchant.length === 0 ? (
        <EmptyState
          title="购物车是空的"
          description="去发现页看看有没有心仪的商品吧。"
          action={
            <Link href="/discover" className={buttonClasses("primary", "sm")}>
              去逛逛
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          {groupsWithMerchant.map((group) => {
            const key = group.merchantId ?? "platform";
            const merchantName = group.merchant?.name["zh-CN"] ?? "平台自营";
            const itemCount = group.lines.reduce((sum, l) => sum + l.item.quantity, 0);

            return (
              <section key={key} className="border-line rounded-xs border">
                <div className="border-line bg-surface-muted flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3">
                  {group.merchant ? (
                    <Link
                      href={`/merchants/${group.merchant.slug}`}
                      className="text-ink hover:text-brand-700 text-sm font-medium"
                    >
                      {merchantName}
                    </Link>
                  ) : (
                    <span className="text-ink text-sm font-medium">{merchantName}</span>
                  )}
                  {group.requiresManualInquiry && (
                    <Badge tone="neutral">该商家商品仅支持人工询价</Badge>
                  )}
                  {group.hasPlatformCheckoutCapableItems && (
                    <Badge tone={paymentEnabled ? "success" : "warning"}>
                      {paymentEnabled ? "支持平台交易" : "含平台交易商品（暂未开放）"}
                    </Badge>
                  )}
                </div>

                <div className="px-5">
                  {group.lines.map((line) => (
                    <CartLineItem
                      key={line.item.id}
                      slug={line.product.slug}
                      name={line.product.name["zh-CN"]}
                      variantLabel={line.variant?.optionLabel["zh-CN"]}
                      pricing={line.product.pricing}
                      initialQuantity={line.item.quantity}
                    />
                  ))}
                </div>

                <div className="border-line flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3">
                  <span className="text-ink-faint text-xs">共 {itemCount} 件</span>
                  <div className="flex flex-wrap gap-2">
                    <BatchInquiryDialog
                      merchantName={merchantName}
                      itemCount={group.lines.length}
                    />
                    {group.tradeModesInGroup.includes("custom_purchase_request") && (
                      <Link href="/custom-purchase" className={buttonClasses("secondary", "sm")}>
                        提交代购需求
                      </Link>
                    )}
                    {group.merchant && (
                      <Link
                        href={`/merchants/${group.merchant.slug}`}
                        className={buttonClasses("ghost", "sm")}
                      >
                        查看商家主页
                      </Link>
                    )}
                  </div>
                </div>
              </section>
            );
          })}

          {!paymentEnabled && (
            <p className="border-line bg-surface-muted text-ink-muted rounded-xs border p-4 text-xs">
              {PAYMENT_DISABLED_NOTICE}
            </p>
          )}
        </div>
      )}
    </PageContainer>
  );
}
