# 合规文档（COMPLIANCE）

> 状态：Stage 08 已完成第一期实现。本文档记录受限制商品、地区限制、风险预警、举报处理与法律文本的实际机制，供后续接入真实 Supabase 项目与法务审核时参考。

## 1. 合规原则

- 平台不向未成年人销售受限制商品（如雪茄类收藏品），也不协助规避进口、税务、运输与海关政策限制。
- 所有合规判断（年龄确认、地区限制、风险关键词命中）均为**辅助提示**，不构成自动化的法律结论；最终处置需要人工审核（`product_reviewer` / `merchant_reviewer` / `customer_service` / `admin`）确认。
- 第一期尚未连接真实 Supabase 项目，凡标注「本地实现」的机制均为浏览器 `localStorage` 或内存演示数据，重启/清除缓存后状态不保留，正式上线前需替换为服务端持久化（详见各小节的迁移路径说明）。

## 2. 受限制商品机制

### 2.1 数据字段（`ProductCompliance`，对应 `products` 表 `compliance_*` 列）

| 字段                   | 说明                                                                       |
| ---------------------- | -------------------------------------------------------------------------- |
| `ageRestricted`        | 是否为年龄限制商品分类（如雪茄类）                                         |
| `minimumAge`           | 最低购买年龄，未设置时前端默认按 18 周岁处理                               |
| `restrictedRegions`    | 限制配送的收货地区列表（省级行政区名称，示例数据，最终清单待合规团队确认） |
| `complianceStatus`     | `not_required` / `pending_review` / `approved` / `rejected`                |
| `requiresManualReview` | 该分类是否强制要求人工审核（不随 `complianceStatus` 变化，是分类级策略）   |
| `legalNoticeId`        | 关联的法律文本（通常指向「受限制商品政策」）                               |

**发布规则**（`tests/unit/mock-data-integrity.test.ts` 强制校验）：`ageRestricted = true` 的商品，`requiresManualReview` 恒为 `true`；只有 `complianceStatus = 'approved'` 后才允许 `status = 'published'`，其余 `complianceStatus` 下不得发布。演示数据中同时保留了 `pending_review`（帕尔马雪茄收藏套装，用于 `/admin/product-reviews` 审核队列演示）与 `approved`（托斯卡纳雪茄品鉴套装，用于公开页面的年龄确认/地区限制拦截演示）两种状态，覆盖完整生命周期。

### 2.2 年龄确认（`AgeConfirmationGate`，本地实现）

- 组件：`src/components/shared/AgeConfirmationGate.tsx`，接入位置：`src/app/products/[slug]/page.tsx`。
- 确认状态写入 `localStorage`，键名 `expectaly:age-confirmed:{contextType}:{contextId}`，对应数据库实体 `age_confirmations`（`context_type` / `context_id` / `confirmed` 字段一致），未来接入真实持久化时可平滑切换为服务端写入，组件对外接口不变。
- 不构成完整身份验证（无实名认证、无证件核验），仅为用户自我声明 + 页面交互拦截。

### 2.3 地区限制（自我声明 + 本地演示）

- 用户在 `AgeConfirmationGate` 内自我声明收货地区（`DECLARED_REGION_OPTIONS`，写入 `localStorage` 键 `expectaly:declared-region`），与 `product.compliance.restrictedRegions` 比对；命中时展示「暂不支持配送至该地区」并阻断购买/联系入口。
- 该声明与 `account/addresses` 中的真实收货地址簿是两套独立数据，避免将「合规自我声明」与「订单实际收货地址」混淆；接入真实后端后，可选择将两者合并（例如默认取用户默认收货地址的省份）。
- `restrictedRegions` 当前为**示例数据**（如「西藏自治区」「香港特别行政区」等），不代表平台已确认的真实法规清单，正式上线前必须由法务与合规团队基于实际海关/税务政策重新核定。

### 2.4 商品审核流程

1. 商家在 `/merchant/products/new` 提交商品，`status` 默认为 `pending_review`（受限制分类的 `compliance_status` 同为 `pending_review`）。
2. `product_reviewer` / `admin` / `super_admin` 在 `/admin/product-reviews` 查看待审核队列（含「受限制商品」标签与风险关键词命中提示），做出审核决定（界面演示，未接入真实状态写入）。
3. 通过后 `compliance_status` 更新为 `approved`，`status` 才可置为 `published`；驳回或需修改则保持不可发布。

## 3. 风险关键词自动预警

- 服务：`src/lib/services/compliance-service.ts`（`parseRiskKeywords` / `findRiskKeywordMatches` / `containsRiskKeyword`），纯函数，覆盖单元测试见 `tests/unit/compliance-service.test.ts`。
- 关键词来源：`system_settings` 表的 `risk_keywords` 键（逗号分隔字符串，第一期演示值：`假货,仿品,一比一,高仿`），后台只读展示于 `/admin/settings`。
- 接入位置：`/admin/reports`（举报描述命中关键词时显示「命中风险关键词」标签）、`/admin/product-reviews`（商品简介/故事命中时同样提示）。
- **该机制仅做提示，不自动下架、不自动封禁**——是否处置仍由人工在审核/举报处理流程中判断。

## 4. 举报与处理闭环

1. 用户/访客通过 `ReportDialog`（商品/商家/评价/内容页通用入口）提交举报，写入 `reports` 表（`status` 默认为 `pending`）。
2. `customer_service` / `admin` / `super_admin` 在 `/admin/reports` 查看全部举报，按「待处理」（`pending` / `investigating`）与「已处理」分组展示，命中风险关键词的举报优先高亮。
3. 处理决定（通过 `ApplicationReviewDialog` 组件，界面演示）对应 `reports.status` 的后续流转：`resolved`（确认无问题）/ `dismissed`（驳回）/ `removed`（下架涉事内容）/ `banned`（封禁账号）。
4. 每一次审核类操作均应写入 `audit_logs`（`action` 形如 `report.resolve` / `product.approve` / `merchant_application.reject`），供 `/admin/audit-logs` 追溯；第一期演示数据预置了 5 条代表性记录，真实写入逻辑留待接入 Supabase 后完成。

**已知限制**：账号封禁（`profiles.status = 'banned'`）与商品/评价下架目前仍是界面交互演示，未接入真实数据写入——这与项目全程遵循的「repositories 第一期只读」原则一致（见 `src/lib/repositories/base.ts` 的 `ReadRepository<T>`），并非本阶段遗漏，而是等待真实 Supabase 项目接入后统一开放写入能力。

## 5. 行级安全策略（RLS）

草案文件：`supabase/migrations/0010_row_level_security.sql`（Stage 08 新增，尚未在真实项目执行）。要点：

- 角色判断辅助函数（`app_current_profile_id()` / `app_has_role()` / `app_is_staff()` / `app_is_super_admin()` / `app_manages_merchant()`）与 `src/lib/permissions/matrix.ts` 的角色权限矩阵保持语义一致。
- 默认拒绝：每张表先 `enable row level security`，再逐条显式授权；`payments` / `payment_transactions` 等支付相关表在 `payment_enabled = false` 期间不开放任何写入策略。
- `audit_logs` 仅允许 `insert`/`select`，不提供 `update`/`delete`，保证审计轨迹不可篡改。
- 详见 `docs/DATABASE_SCHEMA.md` 的迁移文件清单。

## 6. 法律文本状态

全部 11 篇法律文本模板（`用户协议`、`隐私政策`、`Cookie 政策`、`商家入驻协议`、`自主交易免责声明`、`平台交易规则`、`商品发布规范`、`知识产权投诉政策`、`受限制商品政策`、`未成年人保护说明`、`售后及纠纷处理规则`）均通过 `/legal/[slug]` 静态生成，`isPendingLegalReview: true` 横幅在页面顶部展示，明确当前为「待法律顾问审核的模板」，不构成正式法律意见。正式上线前需法务团队逐篇审阅替换。

## 7. 后续工作（超出第一期范围）

- 真实 Supabase Auth 接入后，`age_confirmations`、`audit_logs` 的写入需从本地/内存迁移到服务端，并执行 `0010_row_level_security.sql` 中的策略。
- `restrictedRegions` 清单与「地区自我声明」机制需替换为基于真实收货地址或 IP/号码归属地的判断，并由法务确认具体限制清单。
- 账号封禁、内容下架等举报处理后果需接入真实写入与状态同步（通知用户、失效相关会话等）。
