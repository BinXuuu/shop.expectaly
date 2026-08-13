import type { Metadata } from "next";
import { BrowsingHistoryList } from "@/components/account/BrowsingHistoryList";

export const metadata: Metadata = { title: "浏览历史", robots: { index: false, follow: false } };

export default function AccountHistoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">浏览历史</h1>
        <p className="text-ink-muted mt-1 text-sm">
          浏览历史保存在当前设备浏览器本地，更换设备或清除浏览器数据后将不再保留。
        </p>
      </div>
      <BrowsingHistoryList />
    </div>
  );
}
