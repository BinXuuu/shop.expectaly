import type { Metadata } from "next";
import { StoreProfileForm } from "@/components/merchant";
import { getCurrentProfile } from "@/lib/auth/session";
import { getManagedMerchant } from "@/lib/services/merchant-context";

export const metadata: Metadata = { title: "店铺资料" };

export default async function MerchantStorePage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const merchant = await getManagedMerchant(profile.id);
  if (!merchant) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">店铺资料</h1>
        <p className="text-ink-muted mt-1 text-sm">
          店铺资料将展示在你的商家主页，帮助用户建立信任。
        </p>
      </div>
      <StoreProfileForm merchant={merchant} />
    </div>
  );
}
