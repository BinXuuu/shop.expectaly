"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { PriceDisplayMode, TradeMode } from "@/types";

const TRADE_MODE_OPTIONS: { value: TradeMode; label: string }[] = [
  { value: "display_only", label: "仅展示" },
  { value: "contact_merchant", label: "联系商家" },
  { value: "wechat_contact", label: "添加微信" },
  { value: "manual_inquiry", label: "人工询价" },
  { value: "custom_purchase_request", label: "提交代购需求" },
  { value: "preorder", label: "加入预订" },
  { value: "group_buy", label: "加入拼单" },
  { value: "platform_checkout", label: "平台交易（第一期未开放）" },
];

const DISPLAY_MODE_OPTIONS: { value: PriceDisplayMode; label: string }[] = [
  { value: "both", label: "同时显示人民币与欧元" },
  { value: "eur_only", label: "仅显示欧元" },
  { value: "cny_only", label: "仅显示人民币" },
  { value: "reference_only", label: "仅显示参考价格" },
  { value: "inquiry_only", label: "不显示价格，仅询价" },
];

export interface ProductFormDefaults {
  name?: string;
  categoryId?: string;
  brandId?: string;
  summary?: string;
  story?: string;
  materials?: string;
  dimensions?: string;
  sourceCity?: string;
  sourceStore?: string;
  originalPrice?: number;
  originalCurrency?: "EUR" | "CNY" | "USD";
  displayMode?: PriceDisplayMode;
  tradeModes?: TradeMode[];
  stockQuantity?: number;
  ageRestricted?: boolean;
}

export interface ProductFormProps {
  mode: "create" | "edit";
  categoryOptions: { value: string; label: string }[];
  brandOptions: { value: string; label: string }[];
  defaultValues?: ProductFormDefaults;
}

/**
 * 商品新增/编辑表单。第一期为界面交互演示：提交后展示确认提示并说明审核流程，
 * 尚未接入 products 表的真实写入（留待真实 Supabase 项目接入后补充）。
 */
export function ProductForm({
  mode,
  categoryOptions,
  brandOptions,
  defaultValues,
}: ProductFormProps) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [tradeModes, setTradeModes] = useState<TradeMode[]>(
    defaultValues?.tradeModes ?? ["contact_merchant", "manual_inquiry"],
  );
  const [ageRestricted, setAgeRestricted] = useState(defaultValues?.ageRestricted ?? false);
  const [requiresDeposit, setRequiresDeposit] = useState(false);

  function toggleTradeMode(value: TradeMode) {
    setTradeModes((current) =>
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    );
  }

  if (submitted) {
    return (
      <div className="border-success-200 bg-success-50 flex flex-col gap-3 rounded-xs border p-6">
        <h2 className="text-ink text-sm font-semibold">
          {mode === "create" ? "商品已提交" : "修改已提交"}
        </h2>
        <p className="text-ink-muted text-sm">
          {ageRestricted
            ? "该商品分类受限制，将进入人工审核并核实地区限制，审核通过前不会公开展示。"
            : "商品已进入待审核状态，平台商品审核员将尽快核实并上架。"}
        </p>
        <Button
          variant="secondary"
          className="w-fit"
          onClick={() => router.push("/merchant/products")}
        >
          返回商品列表
        </Button>
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
      <Input
        label="商品名称"
        name="name"
        required
        defaultValue={defaultValues?.name}
        className="sm:col-span-2"
      />
      <Select
        label="商品分类"
        name="categoryId"
        required
        options={categoryOptions}
        defaultValue={defaultValues?.categoryId}
      />
      <Select
        label="所属品牌（可选）"
        name="brandId"
        options={[{ value: "", label: "无品牌 / 平台整理" }, ...brandOptions]}
        defaultValue={defaultValues?.brandId ?? ""}
      />
      <Textarea
        label="商品简介"
        name="summary"
        defaultValue={defaultValues?.summary}
        className="sm:col-span-2"
      />
      <Textarea
        label="商品故事"
        name="story"
        defaultValue={defaultValues?.story}
        className="sm:col-span-2"
      />
      <Input label="材质" name="materials" defaultValue={defaultValues?.materials} />
      <Input label="尺寸" name="dimensions" defaultValue={defaultValues?.dimensions} />
      <Input label="采购城市" name="sourceCity" defaultValue={defaultValues?.sourceCity} />
      <Input label="采购门店" name="sourceStore" defaultValue={defaultValues?.sourceStore} />

      <div className="border-line rounded-xs border p-4 sm:col-span-2">
        <h2 className="text-ink text-sm font-semibold">价格与费用</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Input
            label="原始价格"
            name="originalPrice"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={defaultValues?.originalPrice}
          />
          <Select
            label="原始货币"
            name="originalCurrency"
            options={[
              { value: "EUR", label: "欧元 EUR" },
              { value: "CNY", label: "人民币 CNY" },
              { value: "USD", label: "美元 USD" },
            ]}
            defaultValue={defaultValues?.originalCurrency ?? "EUR"}
          />
          <Select
            label="价格展示方式"
            name="displayMode"
            options={DISPLAY_MODE_OPTIONS}
            defaultValue={defaultValues?.displayMode ?? "both"}
            className="sm:col-span-2"
          />
          <label className="text-ink flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={requiresDeposit}
              onChange={(event) => setRequiresDeposit(event.target.checked)}
              className="border-line-strong h-4 w-4 rounded-xs"
            />
            需要定金
          </label>
          {requiresDeposit && (
            <Input label="定金金额" name="depositAmount" type="number" min={0} step="0.01" />
          )}
        </div>
      </div>

      <div className="border-line rounded-xs border p-4 sm:col-span-2">
        <h2 className="text-ink text-sm font-semibold">交易方式（可多选）</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TRADE_MODE_OPTIONS.map((option) => (
            <label key={option.value} className="text-ink flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={tradeModes.includes(option.value)}
                onChange={() => toggleTradeMode(option.value)}
                className="border-line-strong h-4 w-4 rounded-xs"
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <Input
        label="库存数量"
        name="stockQuantity"
        type="number"
        min={0}
        defaultValue={defaultValues?.stockQuantity ?? 1}
      />
      <Input label="规格说明（可选）" name="variantLabel" placeholder="例如：标准款 / 限量编号版" />

      <label className="text-ink flex items-center gap-2 text-sm sm:col-span-2">
        <input
          type="checkbox"
          checked={ageRestricted}
          onChange={(event) => setAgeRestricted(event.target.checked)}
          className="border-line-strong h-4 w-4 rounded-xs"
        />
        该商品属于受限制商品分类（如雪茄），需要年龄确认与平台人工审核
      </label>

      <div className="sm:col-span-2">
        <Button type="submit" variant="primary" size="lg">
          {mode === "create" ? "提交商品" : "保存修改"}
        </Button>
      </div>
    </form>
  );
}
