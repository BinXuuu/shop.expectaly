# 支付预留设计文档（PAYMENT_RESERVATION）

> 状态：Stage 01 已完成类型层与占位服务实现；购物车/结算页 UI 接入将在 **Stage 06（购物车、询价、订单和支付预留）** 完成。

## 核心原则

- 第一期**不启用真实支付**，功能开关 `paymentEnabled` 默认 `false`（见 `src/lib/config/feature-flags.ts`，对应 `system_settings.payment_enabled`）。
- 支付未开放时，前台商品页 / 购物车统一展示提示（`PAYMENT_DISABLED_NOTICE` 常量）：
  > “平台担保交易正在逐步开放，当前商品请根据页面说明联系商家或提交询价。”
- 不得出现任何虚假的“支付成功”状态；即使 `paymentEnabled` 被后台手动置为 `true`，由于未接入任何真实网关，`unconfiguredPaymentProvider` 仍会统一抛出 `FEATURE_DISABLED` 错误（见下文）。

## 已实现结构（Stage 01）

- 类型层 `src/types/payment.ts`：
  - `PaymentProvider` 接口（可插拔的支付服务商抽象，含 `createPaymentIntent` / `confirmPayment` / `refund`）
  - `Payment`（支付意图记录）、`PaymentTransaction`（网关交互日志）、`Refund` 数据结构
  - `CreatePaymentIntentInput` / `PaymentIntentResult` / `CreateRefundInput` 输入输出结构
  - 幂等键（`idempotencyKey`）、金额与货币字段、订单金额快照（`orderAmountSnapshot`）
- 数据库迁移 `supabase/migrations/0007_pricing_and_payments.sql`：`payments`、`payment_transactions`、`refunds` 三张表，`payments.idempotency_key` 唯一约束
- 服务层 `src/lib/services/payment-service.ts`：`unconfiguredPaymentProvider` 占位实现，所有方法统一抛出 `AppError.featureDisabled(PAYMENT_DISABLED_NOTICE)`；`getPaymentProvider()` 作为唯一获取入口，未来接入真实网关时只需替换其返回值
- 支付回调接口占位：尚未创建 API Route（无第三方网关可回调），留待真实网关选型后在 Stage 06/10 补充 `app/api/payments/webhook` 等路由

## Stage 06 待完成事项

- 购物车结算页 UI：按商家分组展示交易方式，未启用支付时引导用户联系商家 / 发起询价
- 订单创建流程与 `orders.payment_enabled_snapshot` 字段的写入时机
- 后台「系统配置」页对 `payment_enabled` 开关的可视化管理（当前仅 `system_settings` 表与环境变量支持配置）
