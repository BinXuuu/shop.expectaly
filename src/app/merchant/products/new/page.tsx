import type { Metadata } from "next";
import { ProductForm } from "@/components/merchant";
import { getCurrentProfile } from "@/lib/auth/session";
import { getManagedMerchant } from "@/lib/services/merchant-context";
import { brandRepository, categoryRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "新建商品" };

export default async function NewMerchantProductPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const merchant = await getManagedMerchant(profile.id);
  if (!merchant) return null;

  const [categoriesResult, brandsResult] = await Promise.all([
    categoryRepository.findVisible(),
    brandRepository.findAll(),
  ]);

  const categoryOptions = (categoriesResult.ok ? categoriesResult.data : []).map((c) => ({
    value: c.id,
    label: c.name["zh-CN"],
  }));
  const brandOptions = (brandsResult.ok ? brandsResult.data : []).map((b) => ({
    value: b.id,
    label: b.name["zh-CN"],
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">新建商品</h1>
        <p className="text-ink-muted mt-1 text-sm">
          提交后商品状态将变为「待审核」，通过平台商品审核员核实后即可公开展示。
        </p>
      </div>
      <ProductForm mode="create" categoryOptions={categoryOptions} brandOptions={brandOptions} />
    </div>
  );
}
