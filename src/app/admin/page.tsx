import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/session";
import { can } from "@/lib/permissions";
import {
  merchantApplicationRepository,
  merchantRepository,
  orderRepository,
  productRepository,
  profileRepository,
  reportRepository,
} from "@/lib/repositories";

interface StatCard {
  label: string;
  value: number;
  href: string;
}

export default async function AdminDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const roles = profile.roles;

  const stats: StatCard[] = [];

  if (can(roles, "merchant_application:view") || can(roles, "merchant_application:manage")) {
    const applicationsResult = await merchantApplicationRepository.findAll();
    const pending = applicationsResult.ok
      ? applicationsResult.data.filter((a) => a.status === "submitted" || a.status === "in_review")
          .length
      : 0;
    stats.push({ label: "待审核商家申请", value: pending, href: "/admin/merchant-applications" });
  }

  if (can(roles, "product:approve") || can(roles, "product:manage")) {
    const pendingResult = await productRepository.findPendingReview();
    stats.push({
      label: "待审核商品",
      value: pendingResult.ok ? pendingResult.data.length : 0,
      href: "/admin/product-reviews",
    });
  }

  if (can(roles, "report:view") || can(roles, "report:manage")) {
    const reportsResult = await reportRepository.findAll();
    const open = reportsResult.ok
      ? reportsResult.data.filter((r) => r.status === "pending" || r.status === "investigating")
          .length
      : 0;
    stats.push({ label: "待处理举报", value: open, href: "/admin/reports" });
  }

  if (can(roles, "user:view") || can(roles, "user:manage")) {
    const profilesResult = await profileRepository.findAll();
    stats.push({
      label: "平台用户总数",
      value: profilesResult.ok ? profilesResult.data.length : 0,
      href: "/admin/users",
    });
  }

  if (can(roles, "merchant:moderate") || can(roles, "merchant:manage")) {
    const merchantsResult = await merchantRepository.findAll();
    stats.push({
      label: "认证商家总数",
      value: merchantsResult.ok ? merchantsResult.data.length : 0,
      href: "/admin/merchants",
    });
  }

  if (can(roles, "order:view") || can(roles, "order:manage")) {
    const ordersResult = await orderRepository.findAll();
    stats.push({
      label: "订单总数",
      value: ordersResult.ok ? ordersResult.data.length : 0,
      href: "/admin/orders",
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">仪表盘</h1>
        <p className="text-ink-muted mt-1 text-sm">
          {profile.displayName} · 以下数据卡片按你的角色权限展示。
        </p>
      </div>

      {stats.length === 0 ? (
        <p className="text-ink-muted text-sm">
          你的角色暂无可展示的概览数据，请通过左侧导航前往具体功能模块。
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="focus-ring border-line hover:border-brand-200 flex flex-col gap-1 rounded-xs border p-4"
            >
              <span className="text-ink font-serif text-2xl font-semibold">{stat.value}</span>
              <span className="text-ink-muted text-xs">{stat.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
