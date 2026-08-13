import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/merchant";
import { getCurrentProfile } from "@/lib/auth/session";
import { getManagedMerchant } from "@/lib/services/merchant-context";
import { brandRepository, categoryRepository, productRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "编辑商品" };

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMerchantProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const merchant = await getManagedMerchant(profile.id);
  if (!merchant) return null;

  const productResult = await productRepository.findById(id);
  if (!productResult.ok || productResult.data.merchantId !== merchant.id) {
    // 商品不存在，或不属于当前商家管理的店铺——两种情况都不应暴露具体原因，统一 404
    notFound();
  }
  const product = productResult.data;

  const [categoriesResult, brandsResult, variantsResult] = await Promise.all([
    categoryRepository.findVisible(),
    brandRepository.findAll(),
    productRepository.getVariants(product.id),
  ]);

  const categoryOptions = (categoriesResult.ok ? categoriesResult.data : []).map((c) => ({
    value: c.id,
    label: c.name["zh-CN"],
  }));
  const brandOptions = (brandsResult.ok ? brandsResult.data : []).map((b) => ({
    value: b.id,
    label: b.name["zh-CN"],
  }));
  const defaultVariant = variantsResult.ok ? variantsResult.data[0] : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">编辑商品</h1>
        <p className="text-ink-muted mt-1 text-sm">
          修改内容较大时，商品可能重新进入待审核状态，具体以平台审核规则为准。
        </p>
      </div>
      <ProductForm
        mode="edit"
        categoryOptions={categoryOptions}
        brandOptions={brandOptions}
        defaultValues={{
          name: product.name["zh-CN"],
          categoryId: product.categoryId,
          brandId: product.brandId ?? "",
          summary: product.summary?.["zh-CN"],
          story: product.story?.["zh-CN"],
          materials: product.materials?.["zh-CN"],
          dimensions: product.dimensions ?? undefined,
          sourceCity: product.sourceCity ?? undefined,
          sourceStore: product.sourceStore ?? undefined,
          originalPrice: product.pricing.originalPrice,
          originalCurrency: product.pricing.originalCurrency,
          displayMode: product.pricing.displayMode,
          tradeModes: product.tradeModes,
          stockQuantity: defaultVariant?.stockQuantity,
          ageRestricted: product.compliance.ageRestricted,
        }}
      />
    </div>
  );
}
