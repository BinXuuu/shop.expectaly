import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { getCurrentProfile } from "@/lib/auth/session";
import { notificationRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "消息通知", robots: { index: false, follow: false } };

export default async function AccountNotificationsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const result = await notificationRepository.findByUser(profile.id);
  const notifications = result.ok ? result.data : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">消息通知</h1>
        <p className="text-ink-muted mt-1 text-sm">
          第一期提供站内通知，邮件/短信/微信模板消息渠道将陆续接入。
        </p>
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="暂无通知" description="有新的动态时会在这里通知你。" />
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xs border p-4 ${notification.isRead ? "border-line" : "border-brand-200 bg-brand-50"}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-ink text-sm font-medium">{notification.title}</span>
                {!notification.isRead && <Badge tone="accent">未读</Badge>}
              </div>
              <p className="text-ink-muted mt-1 text-sm">{notification.body}</p>
              <span className="text-ink-faint mt-2 block text-xs">
                {notification.sentAt && new Date(notification.sentAt).toLocaleString("zh-CN")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
