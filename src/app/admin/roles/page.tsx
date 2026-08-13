import type { Metadata } from "next";
import { PageContainer } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { getCurrentProfile } from "@/lib/auth/session";
import { isSuperAdmin, ROLE_PERMISSIONS, SUPER_ADMIN_ONLY } from "@/lib/permissions";
import { ALL_ROLES, ROLE_LABELS } from "@/types";

export const metadata: Metadata = { title: "角色权限" };

const MANAGEABLE_ROLES = ALL_ROLES.filter((role) => role !== "guest");

export default async function AdminRolesPage() {
  const profile = await getCurrentProfile();

  if (!profile || !isSuperAdmin(profile.roles)) {
    return (
      <PageContainer className="max-w-xl py-16">
        <h1 className="text-ink font-serif text-2xl font-semibold">无权访问</h1>
        <p className="text-ink-muted mt-3 text-sm">
          角色权限管理仅限超级管理员查看，如需调整角色分配请联系超级管理员。
        </p>
      </PageContainer>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">角色权限</h1>
        <p className="text-ink-muted mt-1 text-sm">
          角色分配变更需接入真实数据库后开放，本页为当前权限矩阵的只读展示（详见
          docs/ROLES_AND_PERMISSIONS.md）。
        </p>
      </div>

      <section>
        <h2 className="text-ink mb-3 text-sm font-semibold">超级管理员独占权限</h2>
        <div className="flex flex-wrap gap-2">
          {SUPER_ADMIN_ONLY.map((permission) => (
            <Badge key={permission} tone="emphasis">
              {permission}
            </Badge>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ink text-sm font-semibold">角色权限矩阵</h2>
        {MANAGEABLE_ROLES.map((role) => (
          <div key={role} className="border-line rounded-xs border p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-ink text-sm font-semibold">{ROLE_LABELS[role]}</span>
              <span className="text-ink-faint text-xs">({role})</span>
            </div>
            {role === "super_admin" ? (
              <p className="text-ink-muted mt-2 text-xs">
                拥有全部权限（含以上超级管理员独占权限），不受权限矩阵列表约束。
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-1">
                {[...new Set(ROLE_PERMISSIONS[role])].map((permission) => (
                  <Badge key={permission} tone="neutral">
                    {permission}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
