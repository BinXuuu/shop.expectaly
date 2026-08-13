import type { CartItem, Product, ProductVariant, Result, TradeMode } from "@/types";
import { err, ok } from "@/types";
import { AppError, toAppErrorShape } from "@/lib/errors/app-error";
import { cartRepository, productRepository } from "@/lib/repositories";

export interface CartLineView {
  item: CartItem;
  product: Product;
  variant: ProductVariant | null;
}

/**
 * 购物车必须按商家分组展示，且不能让用户误认为不同商家的商品可以直接统一付款。
 * requiresInquiry / requiresContactOnly 用于页面提示该分组商品的实际交易方式。
 */
export interface CartGroupView {
  merchantId: string | null;
  lines: CartLineView[];
  tradeModesInGroup: TradeMode[];
  requiresManualInquiry: boolean;
  hasPlatformCheckoutCapableItems: boolean;
}

export interface CartSummaryView {
  groups: CartGroupView[];
  totalQuantity: number;
}

export async function getCartSummary(userId: string): Promise<Result<CartSummaryView>> {
  try {
    const cartResult = await cartRepository.findByUser(userId);
    if (!cartResult.ok) return err(cartResult.error);
    if (!cartResult.data) {
      return ok({ groups: [], totalQuantity: 0 });
    }

    const itemsResult = await cartRepository.getItems(cartResult.data.id);
    if (!itemsResult.ok) return err(itemsResult.error);

    const lines: CartLineView[] = [];
    for (const item of itemsResult.data) {
      const productResult = await productRepository.findById(item.productId);
      if (!productResult.ok) continue; // 商品可能已下架，跳过而非报错，交由页面展示为失效商品
      const variantsResult = await productRepository.getVariants(item.productId);
      const variant = item.variantId
        ? variantsResult.ok
          ? (variantsResult.data.find((v) => v.id === item.variantId) ?? null)
          : null
        : null;
      lines.push({ item, product: productResult.data, variant });
    }

    const groupsByMerchant = new Map<string | null, CartLineView[]>();
    for (const line of lines) {
      const key = line.product.merchantId;
      const existing = groupsByMerchant.get(key) ?? [];
      existing.push(line);
      groupsByMerchant.set(key, existing);
    }

    const groups: CartGroupView[] = Array.from(groupsByMerchant.entries()).map(
      ([merchantId, groupLines]) => {
        const tradeModesInGroup = Array.from(
          new Set(groupLines.flatMap((l) => l.product.tradeModes)),
        );
        return {
          merchantId,
          lines: groupLines,
          tradeModesInGroup,
          requiresManualInquiry: groupLines.every(
            (l) =>
              l.product.tradeModes.includes("manual_inquiry") &&
              !l.product.tradeModes.includes("platform_checkout"),
          ),
          hasPlatformCheckoutCapableItems: groupLines.some((l) =>
            l.product.tradeModes.includes("platform_checkout"),
          ),
        };
      },
    );

    return ok({
      groups,
      totalQuantity: lines.reduce((sum, l) => sum + l.item.quantity, 0),
    });
  } catch (error) {
    return err(toAppErrorShape(error));
  }
}

export function assertCartItemQuantityValid(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw AppError.validation("数量必须是大于 0 的整数", { quantity: "数量必须是大于 0 的整数" });
  }
}
