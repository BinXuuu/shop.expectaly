"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { Merchant } from "@/types";

export interface StoreProfileFormProps {
  merchant: Merchant;
}

/** 店铺资料编辑表单：第一期为界面交互演示，提交后本地确认，尚未接入 merchants 表写入。 */
export function StoreProfileForm({ merchant }: StoreProfileFormProps) {
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <Input label="店铺名称" name="name" defaultValue={merchant.name["zh-CN"]} required />
      <Input label="所在城市" name="city" defaultValue={merchant.city} required />
      <Input label="联系电话" name="contactPhone" defaultValue={merchant.contactPhone ?? ""} />
      <Input
        label="联系邮箱"
        name="contactEmail"
        type="email"
        defaultValue={merchant.contactEmail ?? ""}
      />
      <Input label="微信号" name="wechatId" defaultValue={merchant.wechatId ?? ""} />
      <Input
        label="发货地点"
        name="shippingOrigin"
        defaultValue={merchant.shippingOrigin}
        required
      />
      <Textarea
        label="店铺简介"
        name="introduction"
        defaultValue={merchant.introduction["zh-CN"]}
        required
        className="sm:col-span-2"
      />
      <Textarea
        label="售后规则"
        name="afterSalesPolicy"
        defaultValue={merchant.afterSalesPolicy["zh-CN"]}
        required
        className="sm:col-span-2"
      />
      <div className="sm:col-span-2">
        <label htmlFor="hero-image" className="text-ink text-sm font-medium">
          店铺主视觉图（可选）
        </label>
        <input
          id="hero-image"
          name="heroImage"
          type="file"
          accept="image/*"
          className="focus-ring text-ink-muted file:border-line-strong file:bg-surface file:text-ink mt-1.5 block w-full text-sm file:mr-3 file:rounded-sm file:border file:px-3 file:py-1.5 file:text-sm"
        />
      </div>

      {saved && (
        <p className="text-success-700 text-sm sm:col-span-2">
          店铺资料已保存（演示交互，暂未接入后端持久化）。
        </p>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" variant="primary">
          保存店铺资料
        </Button>
      </div>
    </form>
  );
}
