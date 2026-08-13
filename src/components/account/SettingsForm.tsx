"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Locale, Profile } from "@/types";

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: "zh-CN", label: "简体中文" },
  { value: "it-IT", label: "Italiano（即将支持）" },
  { value: "en-US", label: "English（即将支持）" },
];

export interface SettingsFormProps {
  profile: Profile;
}

/** 账号设置表单：第一期为界面交互演示，提交后本地确认，尚未接入 profiles 表写入。 */
export function SettingsForm({ profile }: SettingsFormProps) {
  const [saved, setSaved] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(true);

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="昵称" name="displayName" defaultValue={profile.displayName} required />
        <Input label="邮箱" name="email" type="email" defaultValue={profile.email ?? ""} />
        <Input label="手机号" name="phone" defaultValue={profile.phone ?? ""} />
        <Select label="语言" name="locale" defaultValue={profile.locale} options={LOCALE_OPTIONS} />
      </div>

      <div className="border-line flex flex-col gap-2 rounded-xs border p-4">
        <h2 className="text-ink text-sm font-semibold">隐私设置</h2>
        <label className="text-ink flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(event) => setMarketingOptIn(event.target.checked)}
            className="border-line-strong h-4 w-4 rounded-xs"
          />
          接收平台活动与商品推荐通知
        </label>
        <p className="text-ink-faint text-xs">
          更多隐私选项（如浏览记录用途、跨站追踪同意）将随 Cookie 政策落地后补充。
        </p>
      </div>

      <div className="border-line bg-surface-muted text-ink-muted rounded-xs border p-4 text-xs">
        当前使用开发环境模拟登录，不涉及密码；接入 Supabase Auth
        后将在此提供密码修改与账号绑定管理。
      </div>

      {saved && (
        <p className="text-success-700 text-sm">设置已保存（演示交互，暂未接入后端持久化）。</p>
      )}

      <Button type="submit" variant="primary" className="w-fit">
        保存设置
      </Button>
    </form>
  );
}
