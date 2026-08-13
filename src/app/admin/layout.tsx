import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { Role } from "@/types";
import { PageContainer } from "@/components/shared";
import { AdminNav } from "@/components/admin/AdminNav";
import { getCurrentProfile } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: { default: "平台后台", template: "%s | 平台后台 · 意料之中～意购" },
  robots: { index: false, follow: false },
};

const ADMIN_FAMILY_ROLES: Role[] = [
  "platform_operator",
  "content_editor",
  "customer_service",
  "product_reviewer",
  "merchant_reviewer",
  "admin",
  "super_admin",
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login?redirect=/admin");
  }

  const hasAdminAccess = profile.roles.some((role) => ADMIN_FAMILY_ROLES.includes(role));

  if (!hasAdminAccess) {
    return (
      <PageContainer className="max-w-xl py-16">
        <h1 className="text-ink font-serif text-2xl font-semibold">无权访问平台后台</h1>
        <p className="text-ink-muted mt-3 text-sm">
          该区域仅面向平台运营、内容、客服与审核团队开放。如果你认为自己应当拥有相应权限，请联系超级管理员分配角色。
        </p>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="grid gap-8 py-10 lg:grid-cols-[220px_1fr]">
      <aside className="flex flex-col gap-4">
        <div className="border-line rounded-xs border p-4">
          <p className="text-ink text-sm font-semibold">{profile.displayName}</p>
          <p className="text-ink-muted mt-0.5 text-xs">{profile.roles.map((r) => r).join(" / ")}</p>
        </div>
        <AdminNav roles={profile.roles} />
      </aside>
      <div className="min-w-0">{children}</div>
    </PageContainer>
  );
}
