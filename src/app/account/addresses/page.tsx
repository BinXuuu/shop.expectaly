import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { AddAddressDialog } from "@/components/account/AddAddressDialog";
import { getCurrentProfile } from "@/lib/auth/session";
import { addressRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "地址管理", robots: { index: false, follow: false } };

export default async function AccountAddressesPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const result = await addressRepository.findByUser(profile.id);
  const addresses = result.ok ? result.data : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-ink font-serif text-2xl font-semibold">地址管理</h1>
          <p className="text-ink-muted mt-1 text-sm">
            管理你的收货地址，代购商品到货后将寄送至指定地址。
          </p>
        </div>
        <AddAddressDialog />
      </div>

      {addresses.length === 0 ? (
        <EmptyState title="暂无收货地址" description="新增一个收货地址，方便后续下单使用。" />
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map((address) => (
            <div key={address.id} className="border-line rounded-xs border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-ink text-sm font-medium">{address.recipientName}</span>
                <span className="text-ink-muted text-sm">{address.phone}</span>
                {address.isDefault && <Badge tone="accent">默认地址</Badge>}
                {address.label && <Badge tone="neutral">{address.label}</Badge>}
              </div>
              <p className="text-ink-muted mt-1 text-sm">
                {address.province} {address.city} {address.district} {address.detail}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
