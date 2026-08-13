"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Textarea";

export interface BatchInquiryDialogProps {
  merchantName: string;
  itemCount: number;
}

/** 批量询价弹层：对购物车中同一商家的多件商品一次性发起询价，第一期为界面交互演示。 */
export function BatchInquiryDialog({ merchantName, itemCount }: BatchInquiryDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleClose() {
    setOpen(false);
    setSubmitted(false);
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        批量询价（{itemCount}）
      </Button>
      <Dialog open={open} onClose={handleClose} title="批量询价" description={merchantName}>
        {submitted ? (
          <div className="flex flex-col gap-4">
            <p className="text-ink text-sm">
              已针对该商家购物车内全部商品提交询价，请在询价记录中查看回复。
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
            <p className="text-ink-muted text-sm">
              将对该商家购物车内的 {itemCount} 件商品统一发起询价。
            </p>
            <Textarea
              label="留言"
              name="message"
              required
              placeholder="请说明规格、颜色或其他需求"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={handleClose}>
                取消
              </Button>
              <Button type="submit" variant="primary">
                提交询价
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
