"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export interface MerchantApplicationFormProps {
  categoryOptions: { value: string; label: string }[];
}

/**
 * 商家入驻申请表单。第一期为界面交互演示：提交后仅本地展示确认提示，
 * 尚未接入 merchant_applications 表的真实写入（留待真实 Supabase 项目接入后补充）。
 */
export function MerchantApplicationForm({ categoryOptions }: MerchantApplicationFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [merchantType, setMerchantType] = useState<"individual" | "company">("individual");
  const [wantsPlatformTransaction, setWantsPlatformTransaction] = useState(true);

  if (submitted) {
    return (
      <div className="border-success-200 bg-success-50 flex flex-col gap-3 rounded-xs border p-6">
        <h2 className="text-ink text-sm font-semibold">申请已提交</h2>
        <p className="text-ink-muted text-sm">
          商家审核员将在数个工作日内完成资料审核，审核结果将通过站内通知告知，请留意消息通知。
        </p>
      </div>
    );
  }

  return (
    <form
      className="grid gap-5 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <span className="text-ink text-sm font-medium">主体类型</span>
        <div className="flex gap-4">
          <label className="text-ink flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="merchantType"
              checked={merchantType === "individual"}
              onChange={() => setMerchantType("individual")}
            />
            个人买手
          </label>
          <label className="text-ink flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="merchantType"
              checked={merchantType === "company"}
              onChange={() => setMerchantType("company")}
            />
            企业
          </label>
        </div>
      </div>

      <Input label={merchantType === "company" ? "企业名称" : "姓名"} name="legalName" required />
      <Input label="所在国家" name="country" defaultValue="Italia" required />
      <Input label="所在城市" name="city" required placeholder="例如：Milano" />
      <Input label="联系人姓名" name="contactName" required />
      <Input label="联系电话" name="contactPhone" required />
      <Input label="联系邮箱" name="contactEmail" type="email" required />
      <Input label="微信号（可选）" name="wechatId" />
      <div>
        <label htmlFor="wechat-qr" className="text-ink text-sm font-medium">
          微信二维码（可选）
        </label>
        <input
          id="wechat-qr"
          name="wechatQrCode"
          type="file"
          accept="image/*"
          className="focus-ring text-ink-muted file:border-line-strong file:bg-surface file:text-ink mt-1.5 block w-full text-sm file:mr-3 file:rounded-sm file:border file:px-3 file:py-1.5 file:text-sm"
        />
      </div>
      <Select
        label="主营类别（可多选，先选一个主类别）"
        name="mainCategory"
        required
        options={categoryOptions}
        className="sm:col-span-2"
      />
      <Textarea
        label="商家/工作室介绍"
        name="introduction"
        required
        className="sm:col-span-2"
        placeholder="介绍你的经营范围、货源渠道与特色"
      />
      <div className="sm:col-span-2">
        <label htmlFor="identity-docs" className="text-ink text-sm font-medium">
          身份或企业资质材料
        </label>
        <input
          id="identity-docs"
          name="identityDocs"
          type="file"
          accept="image/*,.pdf"
          multiple
          required
          className="focus-ring text-ink-muted file:border-line-strong file:bg-surface file:text-ink mt-1.5 block w-full text-sm file:mr-3 file:rounded-sm file:border file:px-3 file:py-1.5 file:text-sm"
        />
      </div>
      <Textarea
        label="采购能力说明"
        name="sourcingCapability"
        required
        className="sm:col-span-2"
        placeholder="长期合作的工坊/经销商、验货方式等"
      />
      <Input label="发货地点" name="shippingOrigin" required placeholder="例如：Milano, Italia" />
      <Textarea
        label="售后规则"
        name="afterSalesPolicy"
        required
        className="sm:col-span-2"
        placeholder="退换货条件、时限与责任划分"
      />
      <label className="text-ink flex items-center gap-2 text-sm sm:col-span-2">
        <input
          type="checkbox"
          checked={wantsPlatformTransaction}
          onChange={(event) => setWantsPlatformTransaction(event.target.checked)}
          className="border-line-strong h-4 w-4 rounded-xs"
        />
        希望支持平台担保交易（功能开放后优先接入）
      </label>
      <div className="sm:col-span-2">
        <Button type="submit" variant="primary" size="lg">
          提交入驻申请
        </Button>
      </div>
    </form>
  );
}
