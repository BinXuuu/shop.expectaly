import type { Metadata } from "next";
import { SettingsForm } from "@/components/account/SettingsForm";
import { getCurrentProfile } from "@/lib/auth/session";

export const metadata: Metadata = { title: "账号设置", robots: { index: false, follow: false } };

export default async function AccountSettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">账号设置</h1>
        <p className="text-ink-muted mt-1 text-sm">管理个人信息、语言与隐私偏好。</p>
      </div>
      <SettingsForm profile={profile} />
    </div>
  );
}
