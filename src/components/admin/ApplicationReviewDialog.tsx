"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Textarea";

export type ReviewDecision = "approve" | "reject" | "needs_more_info";

const DECISION_LABELS: Record<ReviewDecision, string> = {
  approve: "通过审核",
  reject: "驳回申请",
  needs_more_info: "要求补充资料",
};

const DECISION_CONFIRMATIONS: Record<ReviewDecision, string> = {
  approve: "已标记为审核通过，申请人将收到站内通知。",
  reject: "已标记为审核驳回，申请人将收到站内通知与驳回原因。",
  needs_more_info: "已要求申请人补充资料，对方将在站内消息中看到具体说明。",
};

export interface ApplicationReviewDialogProps {
  title: string;
  subject: string;
}

/** 通用审核决定弹层：商品/商家申请等审核场景共用，第一期为界面交互演示，未接入真实状态写入。 */
export function ApplicationReviewDialog({ title, subject }: ApplicationReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [decision, setDecision] = useState<ReviewDecision | null>(null);

  function handleClose() {
    setOpen(false);
    setDecision(null);
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        审核
      </Button>
      <Dialog open={open} onClose={handleClose} title={title} description={subject}>
        {decision ? (
          <div className="flex flex-col gap-4">
            <p className="text-ink text-sm">{DECISION_CONFIRMATIONS[decision]}</p>
            <Button variant="secondary" onClick={handleClose} className="w-fit">
              关闭
            </Button>
          </div>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              setDecision(formData.get("decision") as ReviewDecision);
            }}
          >
            <fieldset className="flex flex-col gap-2">
              <legend className="text-ink text-sm font-medium">审核决定</legend>
              {(Object.keys(DECISION_LABELS) as ReviewDecision[]).map((key) => (
                <label key={key} className="text-ink-muted flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="decision"
                    value={key}
                    defaultChecked={key === "approve"}
                    className="accent-brand-700"
                  />
                  {DECISION_LABELS[key]}
                </label>
              ))}
            </fieldset>
            <Textarea label="审核意见" name="note" placeholder="填写通过/驳回/补充说明的具体原因" />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={handleClose}>
                取消
              </Button>
              <Button type="submit" variant="primary">
                提交审核结果
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
