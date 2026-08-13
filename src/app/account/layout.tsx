import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { PageContainer } from "@/components/shared";
import { AccountNav } from "@/components/account/AccountNav";
import { getCurrentProfile } from "@/lib/auth/session";
import { logout } from "@/lib/auth/actions";

export const metadata: Metadata = {
  title: { default: "用户中心", template: "%s | 用户中心 · 意料之中～意购" },
  robots: { index: false, follow: false },
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login?redirect=/account");
  }

  return (
    <PageContainer className="grid gap-8 py-10 lg:grid-cols-[220px_1fr]">
      <aside className="flex flex-col gap-4">
        <div className="border-line rounded-xs border p-4">
          <p className="text-ink text-sm font-semibold">{profile.displayName}</p>
          <p className="text-ink-muted mt-0.5 text-xs">
            {profile.email ?? profile.phone ?? "开发环境账号"}
          </p>
        </div>
        <AccountNav />
        <form action={logout}>
          <button
            type="submit"
            className="focus-ring border-line text-ink-muted hover:border-danger-200 hover:text-danger-900 w-full rounded-xs border px-3 py-2 text-left text-sm"
          >
            退出登录
          </button>
        </form>
      </aside>
      <div className="min-w-0">{children}</div>
    </PageContainer>
  );
}
