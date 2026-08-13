# 数据库架构文档（DATABASE_SCHEMA）

> 状态：Stage 01 已完成。TypeScript 类型定义于 `src/types/`，Supabase 迁移 SQL 草案位于 `supabase/migrations/`，
> 第一期数据访问层使用 `src/data/mock/` 演示数据 + `src/lib/repositories/` 封装，尚未连接真实 Supabase 项目。

## 通用约定

所有实体（除个别关联表）遵循以下公共约定，对应 `src/types/common.ts` 中的 `BaseEntity`：

| 字段                        | 类型          | 说明                                                                 |
| --------------------------- | ------------- | -------------------------------------------------------------------- |
| `id`                        | `uuid`        | 主键，默认 `gen_random_uuid()`                                       |
| `created_at`                | `timestamptz` | 创建时间，`not null default now()`                                   |
| `updated_at`                | `timestamptz` | 更新时间，`not null default now()`                                   |
| `deleted_at`                | `timestamptz` | 软删除标记，`null` 表示未删除；所有查询默认过滤 `deleted_at is null` |
| `created_by` / `updated_by` | `uuid`        | 创建者/修改者，引用 `profiles(id)`，可为 `null`（系统/种子数据）     |

多语言字段（`LocalizedText`）统一存储为 `jsonb`，形如 `{"zh-CN": "...", "en-US": "...", "it-IT": "..."}`，第一期只保证 `zh-CN` 必填。

金额字段统一使用 `numeric(12, 2)`（汇率使用 `numeric(14, 6)`），货币字段为 `text` + `check in ('EUR', 'CNY', 'USD')`。

枚举字段统一使用 `text` + `check (col in (...))` 而非 `create type ... as enum`，便于后续增删枚举值时无需 `alter type`。

RLS（行级安全策略）草案见 `supabase/migrations/0010_row_level_security.sql`（Stage 08 编写），策略逻辑与 `src/lib/permissions/matrix.ts` 的角色权限矩阵保持一致；尚未在真实 Supabase 项目上执行验证，接入真实 Auth 后需结合压力测试重新确认。

## 迁移文件清单（`supabase/migrations/`）

| 文件                                 | 覆盖实体                                                                                                                             |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `0001_extensions_and_core.sql`       | `profiles`、`user_roles`、`addresses`                                                                                                |
| `0002_catalog.sql`                   | `brands`、`categories`、`product_tags`                                                                                               |
| `0003_merchants.sql`                 | `merchant_applications`、`merchants`、`merchant_members`、`merchant_verifications`                                                   |
| `0004_products.sql`                  | `products`、`product_variants`、`product_media`、`product_tag_relations`、`inventories`                                              |
| `0005_commerce.sql`                  | `carts`、`cart_items`、`wishlists`、`wishlist_items`、`inquiries`、`inquiry_messages`、`merchant_quotes`、`custom_purchase_requests` |
| `0006_orders_and_fulfillment.sql`    | `orders`、`order_items`、`order_status_history`、`purchase_progress`、`group_buys`、`group_buy_members`、`preorders`                 |
| `0007_pricing_and_payments.sql`      | `exchange_rates`、`price_snapshots`、`payments`、`payment_transactions`、`refunds`                                                   |
| `0008_content_and_editorial.sql`     | `content_pages`、`editorial_collections`、`editorial_collection_items`、`city_guides`、`faqs`、`legal_documents`                     |
| `0009_trust_safety_and_settings.sql` | `product_reviews`、`merchant_reviews`、`reports`、`notifications`、`age_confirmations`、`audit_logs`、`system_settings`              |
| `0010_row_level_security.sql`        | 全部 45 张表的 RLS 策略草案（角色判断辅助函数 + 逐表 `select`/`insert`/`update` 策略），不建新表                                     |

迁移文件按依赖顺序编号执行（如 `products` 依赖 `merchants`/`brands`/`categories`；`price_snapshots` 的外键在 `cart_items`/`order_items` 建表后通过 `alter table` 补充，避免建表顺序循环依赖）。

## 核心实体设计要点

- **商品发布主体**（`products.publisher_type` + `merchant_id`）：`publisher_type = 'platform'` 时 `merchant_id` 必须为 `null`，通过 `check` 约束强制保证，对应 `docs/PROJECT_REQUIREMENTS.md` 七「商品来源与交易模式」。
- **交易标签与商品分类分离**：`product_tag_relations`（多对多）独立于 `products.category_id`（单一从属分类）。
- **价格字段内联在 `products` 表**（`price_*` 前缀列）而非拆分独立表，因为价格配置与商品是 1:1 关系且经常一起读取；历史价格通过 `price_snapshots` 表单独记录，避免和当前商品价格混淆。
- **受限制商品合规字段**（`compliance_*` 前缀列）：`age_restricted`、`minimum_age`、`restricted_regions`、`compliance_status`、`requires_manual_review`、`legal_notice_id`，对应 `docs/COMPLIANCE.md`。
- **订单状态机按 `order_kind` 分叉**：`orders.status` 的合法取值通过 `check` 约束按 `order_kind`（`platform` / `self_negotiated`）区分为两套完全不同的状态集合，应用层状态机逻辑见 `src/lib/services/order-status-service.ts`。
- **`purchase_progress` 与 `order_status_history` 分离**：前者是面向用户的友好进度时间线（仅平台订单采购/物流阶段），后者是完整的系统审计轨迹（任意状态变更都会记录，供客服/管理后台追溯）。
- **支付相关表为预留结构**：`payments.provider` 默认 `'unconfigured'`，第一期 `payment_enabled` 系统设置为 `false`，应用层（见 `src/lib/services/payment-service.ts`）不接入任何真实网关。
- **多语言富文本内容**（`content_pages`、`editorial_collections`、`city_guides`、`faqs`、`legal_documents`）统一使用 `jsonb` 存储 `LocalizedText`，避免为每种语言单独建表。
- **`system_settings`** 为通用键值配置表，初始写入三个功能开关记录（`payment_enabled` / `wechat_login_enabled` / `main_site_sso_enabled`），供后台「系统配置」页面读写；应用层实际读取逻辑见 `src/lib/config/feature-flags.ts`（当前从环境变量读取，接入 Supabase 后可切换为读取本表）。

## 索引设计原则

- 高频筛选字段（`status`、`category_id`、`merchant_id`、`brand_id` 等）均建立部分索引（`where deleted_at is null`），减少软删除记录对索引的干扰。
- 关联查询高频字段（如 `order_items.order_id`、`inquiry_messages.inquiry_id`）建立外键索引，支撑详情页的一次性关联查询。
- 唯一约束用于业务唯一性保证：`products.slug`、`merchants.slug`、`brands.slug`、`categories.slug`、`orders.order_number`、`payments.idempotency_key` 等。

## 第一期数据层实现（TypeScript）

由于尚未连接真实 Supabase 项目，第一期数据访问路径为：

```
页面/组件
  -> src/lib/services/*        （业务逻辑：定价换算、状态流转校验等）
  -> src/lib/repositories/*    （统一读取接口 ReadRepository<T> + 领域查询方法）
  -> src/data/mock/*           （内存数组形式的演示数据，非真实商家授权数据）
```

`src/lib/repositories/base.ts` 中的 `createInMemoryRepository<T>()` 是唯一的通用读取实现；切换到 Supabase 时，只需新增一个满足 `ReadRepository<T>` 接口的 Supabase 版本实现并替换具体 repository 的组装方式，不影响 `lib/services` 与页面层代码。

## 后续阶段计划

- Stage 04：接入 Supabase Auth，`profiles.auth_user_id` 与真实 Auth 用户绑定。
- Stage 05 / 07：商家后台、管理后台的写操作接入真实数据库读写（当前 repositories 仅提供只读接口）。
- Stage 08：已补充 RLS 策略草案（`0010_row_level_security.sql`）；审计日志的实际写入逻辑与受限制商品的地区限制校验仍为本地/演示实现，接入真实 Supabase 项目后需切换为服务端持久化。
- Stage 10：提供从模拟数据到 Supabase 项目的种子数据导入脚本说明。
