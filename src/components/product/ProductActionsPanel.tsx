"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import type { Merchant, Product } from "@/types";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PAYMENT_DISABLED_NOTICE } from "@/lib/config/feature-flags";

export interface ProductActionsPanelProps {
  product: Product;
  merchant: Merchant | null;
  paymentEnabled: boolean;
}

type DialogKind = "contact" | "inquiry" | "preorder" | "groupBuy" | null;

/**
 * 商品交易操作面板：按商品配置的 tradeModes 动态展示可用操作。
 * 站内询价 / 预订 / 拼单表单第一期仅做界面交互演示（提交后本地确认提示），
 * 实际数据写入与商家侧通知留待 Stage 06 商务系统接入。
 */
export function ProductActionsPanel({
  product,
  merchant,
  paymentEnabled,
}: ProductActionsPanelProps) {
  const [dialogKind, setDialogKind] = useState<DialogKind>(null);
  const [submitted, setSubmitted] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [inCart, setInCart] = useState(false);

  const modes = product.tradeModes;

  function openDialog(kind: DialogKind) {
    setSubmitted(false);
    setDialogKind(kind);
  }

  function closeDialog() {
    setDialogKind(null);
    setSubmitted(false);
  }

  function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({ title: product.name["zh-CN"], url: window.location.href })
        .catch(() => undefined);
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => undefined);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {(modes.includes("contact_merchant") || modes.includes("wechat_contact")) && (
          <Button variant="secondary" onClick={() => openDialog("contact")}>
            <MessageCircle aria-hidden="true" className="h-4 w-4" />
            联系商家
          </Button>
        )}
        {modes.includes("manual_inquiry") && (
          <Button variant="secondary" onClick={() => openDialog("inquiry")}>
            发起人工询价
          </Button>
        )}
        {modes.includes("custom_purchase_request") && (
          <Link href="/custom-purchase" className={buttonClasses("secondary")}>
            提交代购需求
          </Link>
        )}
        {modes.includes("preorder") && (
          <Button variant="secondary" onClick={() => openDialog("preorder")}>
            加入预订
          </Button>
        )}
        {modes.includes("group_buy") && (
          <Button variant="secondary" onClick={() => openDialog("groupBuy")}>
            加入拼单
          </Button>
        )}
        {modes.includes("platform_checkout") && (
          <Button variant="primary" disabled title={PAYMENT_DISABLED_NOTICE}>
            平台交易暂未开放
          </Button>
        )}
      </div>

      {modes.includes("platform_checkout") && !paymentEnabled && (
        <p className="text-ink-faint text-xs">{PAYMENT_DISABLED_NOTICE}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant={inCart ? "primary" : "secondary"} onClick={() => setInCart((v) => !v)}>
          {inCart ? "已加入购物车" : "加入购物车"}
        </Button>
        <Button variant="ghost" onClick={() => setFavorited((v) => !v)}>
          <Heart
            aria-hidden="true"
            className={favorited ? "text-danger-900 h-4 w-4 fill-current" : "h-4 w-4"}
          />
          {favorited ? "已收藏" : "收藏"}
        </Button>
        <Button variant="ghost" onClick={handleShare}>
          <Share2 aria-hidden="true" className="h-4 w-4" />
          分享
        </Button>
      </div>

      <Dialog
        open={dialogKind === "contact"}
        onClose={closeDialog}
        title="联系商家"
        description={merchant?.name["zh-CN"]}
      >
        {merchant ? (
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-ink-muted">{merchant.introduction["zh-CN"]}</p>
            {merchant.contactPhone && (
              <p>
                <span className="text-ink-muted">联系电话：</span>
                {merchant.contactPhone}
              </p>
            )}
            {merchant.wechatId && (
              <p>
                <span className="text-ink-muted">微信号：</span>
                {merchant.wechatId}
              </p>
            )}
            <p className="text-ink-faint text-xs">
              请在联系商家时说明商品名称与规格，交易细节由双方自行协商。
            </p>
          </div>
        ) : (
          <p className="text-ink-muted text-sm">该商品由平台自营，暂无第三方商家联系方式。</p>
        )}
      </Dialog>

      <Dialog open={dialogKind === "inquiry"} onClose={closeDialog} title="发起人工询价">
        {submitted ? (
          <ConfirmationMessage
            onClose={closeDialog}
            text="询价已提交，商家将在站内消息中回复报价。"
          />
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <Input label="数量" name="quantity" type="number" min={1} defaultValue={1} required />
            <Input
              label="预算（可选）"
              name="budget"
              type="number"
              min={0}
              placeholder="例如 300"
            />
            <Textarea
              label="留言"
              name="message"
              required
              placeholder="请说明规格、颜色或其他需求"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={closeDialog}>
                取消
              </Button>
              <Button type="submit" variant="primary">
                提交询价
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      <Dialog open={dialogKind === "preorder"} onClose={closeDialog} title="加入预订">
        {submitted ? (
          <ConfirmationMessage
            onClose={closeDialog}
            text="预订意向已提交，商家将与你确认定金与到货时间。"
          />
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            {product.pricing.requiresDeposit && product.pricing.depositAmount && (
              <p className="text-ink-muted text-sm">
                该商品需支付定金 €{product.pricing.depositAmount.toFixed(2)}
                ，具体支付方式请与商家协商。
              </p>
            )}
            <Input label="数量" name="quantity" type="number" min={1} defaultValue={1} required />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={closeDialog}>
                取消
              </Button>
              <Button type="submit" variant="primary">
                确认预订意向
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      <Dialog open={dialogKind === "groupBuy"} onClose={closeDialog} title="加入拼单">
        {submitted ? (
          <ConfirmationMessage
            onClose={closeDialog}
            text="已加入拼单，达到成团数量后商家将统一安排采购。"
          />
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <Input label="数量" name="quantity" type="number" min={1} defaultValue={1} required />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={closeDialog}>
                取消
              </Button>
              <Button type="submit" variant="primary">
                确认加入拼单
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}

function ConfirmationMessage({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-ink text-sm">{text}</p>
      <Button variant="secondary" onClick={onClose} className="w-fit">
        关闭
      </Button>
    </div>
  );
}
