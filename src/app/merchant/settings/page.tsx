import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { getCurrentProfile } from "@/lib/auth/session";
import { getManagedMerchant } from "@/lib/services/merchant-context";
import { merchantMemberRepository, profileRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "账号安全" };

const MEMBER_ROLE_LABELS = { owner: "店主", staff: "员工" } as const;

export default async function MerchantSettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const merchant = await getManagedMerchant(profile.id);
  if (!merchant) return null;

  const membersResult = await merchantMemberRepository.findByMerchant(merchant.id);
  const members = membersResult.ok ? membersResult.data : [];

  const memberProfiles = await Promise.all(
    members.map(async (member) => {
      const profileResult = await profileRepository.findById(member.userId);
      return { member, profile: profileResult.ok ? profileResult.data : null };
    }),
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">账号安全</h1>
        <p className="text-ink-muted mt-1 text-sm">管理店铺团队成员与账号安全设置。</p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-ink text-sm font-semibold">团队成员</h2>
        <div className="flex flex-col gap-2">
          {memberProfiles.map(({ member, profile: memberProfile }) => (
            <div
              key={member.id}
              className="border-line flex items-center justify-between gap-3 rounded-xs border p-4"
            >
              <span className="text-ink text-sm">{memberProfile?.displayName ?? "未知用户"}</span>
              <Badge tone={member.role === "owner" ? "accent" : "neutral"}>
                {MEMBER_ROLE_LABELS[member.role]}
              </Badge>
            </div>
          ))}
        </div>
      </section>

      <div className="border-line bg-surface-muted text-ink-muted rounded-xs border p-4 text-xs">
        当前使用开发环境模拟登录，不涉及密码；接入 Supabase Auth
        后将在此提供密码修改、多成员邀请与权限分配管理。
      </div>
    </div>
  );
}
