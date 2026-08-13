import type {
  CreatePaymentIntentInput,
  CreateRefundInput,
  PaymentIntentResult,
  PaymentProvider,
  PaymentTransaction,
  Refund,
} from "@/types";
import { AppError } from "@/lib/errors/app-error";
import { PAYMENT_DISABLED_NOTICE } from "@/lib/config/feature-flags";

/**
 * 占位支付服务商实现。第一期不存在任何真实支付网关接入，
 * 无论 payment_enabled 开关状态如何，均统一抛出 FEATURE_DISABLED 错误，
 * 避免出现虚假的“支付成功”。未来接入真实网关（支付宝 / 微信支付 / Stripe 等）时，
 * 实现新的 PaymentProvider 并替换 getPaymentProvider() 的返回值，调用方无需改动。
 */
export const unconfiguredPaymentProvider: PaymentProvider = {
  name: "unconfigured",

  async createPaymentIntent(_input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
    throw AppError.featureDisabled(PAYMENT_DISABLED_NOTICE);
  },

  async confirmPayment(_paymentId: string): Promise<PaymentTransaction> {
    throw AppError.featureDisabled(PAYMENT_DISABLED_NOTICE);
  },

  async refund(_input: CreateRefundInput): Promise<Refund> {
    throw AppError.featureDisabled(PAYMENT_DISABLED_NOTICE);
  },
};

export function getPaymentProvider(): PaymentProvider {
  return unconfiguredPaymentProvider;
}
