"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";

/** 新增地址弹层：第一期为界面交互演示，提交后本地确认，尚未接入地址表写入。 */
export function AddAddressDialog() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleClose() {
    setOpen(false);
    setSubmitted(false);
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        新增地址
      </Button>
      <Dialog open={open} onClose={handleClose} title="新增收货地址">
        {submitted ? (
          <div className="flex flex-col gap-4">
            <p className="text-ink text-sm">地址已保存（演示交互，暂未接入后端持久化）。</p>
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
            <Input label="收货人姓名" name="recipientName" required />
            <Input label="联系电话" name="phone" required />
            <Input label="省份/城市" name="city" required className="sm:col-span-2" />
            <Input label="详细地址" name="detail" required className="sm:col-span-2" />
            <Input label="邮政编码（可选）" name="postalCode" />
            <Input label="标签（可选）" name="label" placeholder="家 / 公司" />
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="ghost" onClick={handleClose}>
                取消
              </Button>
              <Button type="submit" variant="primary">
                保存地址
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
