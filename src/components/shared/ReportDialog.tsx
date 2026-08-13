"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import type { ReportCategory, ReportedEntityType } from "@/types";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export interface ReportDialogProps {
  reportedType: ReportedEntityType;
  reportedLabel: string;
  triggerClassName?: string;
}

const CATEGORY_OPTIONS: { value: ReportCategory; label: string }[] = [
  { value: "infringement", label: "侵权内容" },
  { value: "false_information", label: "虚假信息" },
  { value: "restricted_product", label: "违规商品" },
  { value: "suspicious_transaction", label: "可疑交易" },
  { value: "minor_risk", label: "未成年人相关风险" },
  { value: "other", label: "其他" },
];

/**
 * 通用举报入口：商品/商家/评价/内容均可复用。第一期为界面交互演示，
 * 提交后仅本地展示确认提示，尚未接入 reports 表的真实写入（对应 Stage 07/08 后台处理流程）。
 */
export function ReportDialog({ reportedType, reportedLabel, triggerClassName }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleClose() {
    setOpen(false);
    setSubmitted(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "focus-ring text-ink-faint hover:text-ink-muted inline-flex items-center gap-1 rounded-xs text-xs"
        }
      >
        <Flag aria-hidden="true" className="h-3 w-3" />
        举报{reportedLabel}
      </button>

      <Dialog open={open} onClose={handleClose} title={`举报${reportedLabel}`}>
        {submitted ? (
          <div className="flex flex-col gap-4">
            <p className="text-ink text-sm">
              举报已提交，平台将尽快核实处理。感谢你帮助维护社区内容质量。
            </p>
            <Button variant="secondary" onClick={handleClose} className="w-fit">
              关闭
            </Button>
          </div>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <input type="hidden" name="reportedType" value={reportedType} />
            <Select label="举报类型" name="category" required options={CATEGORY_OPTIONS} />
            <Textarea
              label="详细说明"
              name="description"
              required
              placeholder="请描述具体情况，以便平台核实"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={handleClose}>
                取消
              </Button>
              <Button type="submit" variant="primary">
                提交举报
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
