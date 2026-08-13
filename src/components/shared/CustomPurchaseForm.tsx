"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const VISIBILITY_OPTIONS = [
  { value: "platform_only", label: "仅平台可见" },
  { value: "all_verified_merchants", label: "所有认证商家可见" },
  { value: "specific_merchants", label: "指定商家可见（后续可在需求详情中选择）" },
];

const CURRENCY_OPTIONS = [
  { value: "EUR", label: "欧元 EUR" },
  { value: "CNY", label: "人民币 CNY" },
  { value: "USD", label: "美元 USD" },
];

/**
 * 自定义代购需求表单。第一期为界面交互演示：提交后仅本地展示确认提示，
 * 尚未接入 custom_purchase_requests 表的真实写入与商家可见性匹配逻辑（留待 Stage 06 接入）。
 */
export function CustomPurchaseForm() {
  const [submitted, setSubmitted] = useState(false);
  const [acceptsSimilar, setAcceptsSimilar] = useState(true);
  const [prefersPlatform, setPrefersPlatform] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="border-success-200 bg-success-50 flex flex-col gap-3 rounded-xs border p-6">
        <h2 className="text-ink text-sm font-semibold">需求已提交</h2>
        <p className="text-ink-muted text-sm">
          平台与符合可见范围的认证商家将会看到你的代购需求，请留意站内消息与通知中心的回复。
        </p>
        <Button variant="secondary" className="w-fit" onClick={() => setSubmitted(false)}>
          再提交一个需求
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      <Input
        label="商品名称"
        name="productName"
        required
        placeholder="例如：Buccellati 风格纯银餐勺"
      />
      <Input label="品牌（可选）" name="brandName" placeholder="如已知品牌名称" />
      <Input label="参考链接（可选）" name="referenceUrl" type="url" placeholder="https://" />
      <Input label="期望规格（可选）" name="expectedSpec" placeholder="尺寸、颜色、型号等" />
      <div className="sm:col-span-2">
        <label htmlFor="reference-image" className="text-ink text-sm font-medium">
          商品图片或截图（可选）
        </label>
        <input
          id="reference-image"
          name="referenceImage"
          type="file"
          accept="image/*"
          className="focus-ring text-ink-muted file:border-line-strong file:bg-surface file:text-ink mt-1.5 block w-full text-sm file:mr-3 file:rounded-sm file:border file:px-3 file:py-1.5 file:text-sm"
        />
      </div>
      <Input label="数量" name="quantity" type="number" min={1} defaultValue={1} required />
      <Input label="收货城市" name="shippingCity" required placeholder="例如：上海市" />
      <Input label="期望到货时间（可选）" name="expectedByDate" type="date" />
      <Select
        label="预算货币"
        name="budgetCurrency"
        options={CURRENCY_OPTIONS}
        defaultValue="EUR"
      />
      <Input
        label="预算金额（可选）"
        name="budgetAmount"
        type="number"
        min={0}
        placeholder="例如 300"
      />
      <Select
        label="可见范围"
        name="visibility"
        options={VISIBILITY_OPTIONS}
        defaultValue="all_verified_merchants"
        className="sm:col-span-2"
      />
      <div className="flex items-center gap-2 sm:col-span-2">
        <input
          id="accepts-similar"
          type="checkbox"
          checked={acceptsSimilar}
          onChange={(event) => setAcceptsSimilar(event.target.checked)}
          className="border-line-strong h-4 w-4 rounded-xs"
        />
        <label htmlFor="accepts-similar" className="text-ink text-sm">
          接受类似款（非完全一致也可以）
        </label>
      </div>
      <div className="flex items-center gap-2 sm:col-span-2">
        <input
          id="prefers-platform"
          type="checkbox"
          checked={prefersPlatform}
          onChange={(event) => setPrefersPlatform(event.target.checked)}
          className="border-line-strong h-4 w-4 rounded-xs"
        />
        <label htmlFor="prefers-platform" className="text-ink text-sm">
          希望走平台担保交易（当前暂未开放，将优先匹配支持担保的商家）
        </label>
      </div>
      <Textarea
        label="备注（可选）"
        name="note"
        className="sm:col-span-2"
        placeholder="其他补充说明"
      />
      <div className="sm:col-span-2">
        <Button type="submit" variant="primary" size="lg">
          提交代购需求
        </Button>
      </div>
    </form>
  );
}
