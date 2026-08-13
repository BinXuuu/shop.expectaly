"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export interface InquiryReplyDialogProps {
  inquiryId: string;
  productName: string;
}

/** 商家回复询价弹层：第一期为界面交互演示，提交后本地确认，尚未接入 merchant_quotes 表写入。 */
export function InquiryReplyDialog({ productName }: InquiryReplyDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleClose() {
    setOpen(false);
    setSubmitted(false);
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        回复报价
      </Button>
      <Dialog open={open} onClose={handleClose} title="回复报价" description={productName}>
        {submitted ? (
          <div className="flex flex-col gap-4">
            <p className="text-ink text-sm">报价已发送给用户，对方将在站内消息中查看。</p>
            <Button variant="secondary" onClick={handleClose} className="w-fit">
              关闭
            </Button>
          </div>
        ) : (
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <Input label="报价金额" name="quotedPrice" type="number" min={0} step="0.01" required />
            <Input label="运费" name="shippingFee" type="number" min={0} step="0.01" />
            <Input label="服务费" name="serviceFee" type="number" min={0} step="0.01" />
            <Input label="税费" name="taxFee" type="number" min={0} step="0.01" />
            <Input label="报价有效期" name="validUntil" type="date" className="sm:col-span-2" />
            <Textarea label="备注" name="note" className="sm:col-span-2" />
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="ghost" onClick={handleClose}>
                取消
              </Button>
              <Button type="submit" variant="primary">
                发送报价
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
