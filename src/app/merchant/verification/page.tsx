import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { getCurrentProfile } from "@/lib/auth/session";
import { getManagedMerchant } from "@/lib/services/merchant-context";
import type { MerchantVerificationLevel } from "@/types";

export const metadata: Metadata = { title: "认证资料" };

const VERIFICATION_LABELS: Record<MerchantVerificationLevel, string> = {
  individual_verified: "个人认证",
  company_verified: "企业认证",
  italy_local_verified: "意大利本地认证",
  platform_partner: "平台合作商家",
  platform_owned: "平台自营",
};

const ALL_LEVELS: MerchantVerificationLevel[] = [
  "individual_verified",
  "company_verified",
  "italy_local_verified",
  "platform_partner",
];

export default async function MerchantVerificationPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const merchant = await getManagedMerchant(profile.id);
  if (!merchant) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">认证资料</h1>
        <p className="text-ink-muted mt-1 text-sm">
          认证信息由平台商家审核员人工审核，审核通过后自动展示于店铺主页。
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {ALL_LEVELS.map((level) => {
          const owned = merchant.verificationLevels.includes(level);
          return (
            <div
              key={level}
              className="border-line flex items-center justify-between gap-3 rounded-xs border p-4"
            >
              <span className="text-ink text-sm">{VERIFICATION_LABELS[level]}</span>
              {owned ? <Badge tone="success">已认证</Badge> : <Badge tone="muted">未认证</Badge>}
            </div>
          );
        })}
      </div>

      <div className="border-line rounded-xs border p-4">
        <label htmlFor="verification-docs" className="text-ink text-sm font-medium">
          上传补充认证材料
        </label>
        <input
          id="verification-docs"
          name="verificationDocs"
          type="file"
          accept="image/*,.pdf"
          multiple
          className="focus-ring text-ink-muted file:border-line-strong file:bg-surface file:text-ink mt-1.5 block w-full text-sm file:mr-3 file:rounded-sm file:border file:px-3 file:py-1.5 file:text-sm"
        />
        <p className="text-ink-faint mt-2 text-xs">
          上传后由商家审核员人工复核，审核流程与结果通知第一期为界面演示，尚未接入真实存储与审核队列。
        </p>
      </div>
    </div>
  );
}
