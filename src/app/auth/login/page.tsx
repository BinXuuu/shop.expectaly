import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/shared";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentProfile } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/auth/types";
import { getFeatureFlags } from "@/lib/config/feature-flags";

export const metadata: Metadata = {
  title: "登录",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  wechat_not_configured: "微信登录尚未开放，请先使用邮箱或手机号登录。",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const { redirect: redirectTo, error } = await searchParams;

  const currentProfile = await getCurrentProfile();
  if (currentProfile) {
    redirect(safeRedirectPath(redirectTo));
  }

  const { wechatLoginEnabled } = getFeatureFlags();

  return (
    <PageContainer className="max-w-md py-16">
      <h1 className="text-ink font-serif text-2xl font-semibold">登录</h1>
      <p className="text-ink-muted mt-2 text-sm">
        与 expectaly.com 主站账号互通，可直接使用主站的邮箱和密码登录。
      </p>
      <div className="mt-8">
        <LoginForm
          redirectTo={redirectTo}
          wechatLoginEnabled={wechatLoginEnabled}
          errorMessage={error ? ERROR_MESSAGES[error] : undefined}
        />
      </div>
    </PageContainer>
  );
}
