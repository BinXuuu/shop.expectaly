"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

/** 采购现场/店铺内容发布表单：第一期为界面交互演示，尚未接入 content_pages 等内容表写入。 */
export function PublishContentForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="border-success-200 bg-success-50 flex flex-col gap-3 rounded-xs border p-6">
        <p className="text-ink text-sm">内容已提交，将展示在你的商家主页「采购现场」板块。</p>
        <Button variant="secondary" className="w-fit" onClick={() => setSubmitted(false)}>
          再发布一条
        </Button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <Input label="标题" name="title" required placeholder="例如：米兰工坊采购实拍" />
      <Textarea
        label="内容描述"
        name="description"
        required
        placeholder="分享采购、验货或工坊探访的实况"
      />
      <div>
        <label htmlFor="content-images" className="text-ink text-sm font-medium">
          配图（可选，最多 6 张）
        </label>
        <input
          id="content-images"
          name="images"
          type="file"
          accept="image/*"
          multiple
          className="focus-ring text-ink-muted file:border-line-strong file:bg-surface file:text-ink mt-1.5 block w-full text-sm file:mr-3 file:rounded-sm file:border file:px-3 file:py-1.5 file:text-sm"
        />
      </div>
      <Button type="submit" variant="primary" className="w-fit">
        发布
      </Button>
    </form>
  );
}
