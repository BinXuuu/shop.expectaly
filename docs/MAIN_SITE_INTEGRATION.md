# 主站账号互通设计文档（MAIN_SITE_INTEGRATION）

> 状态：Stage 04 已完成本地开发替代方案（开发环境模拟登录）与目标架构设计。
> 本文档不修改、不连接 expectaly.com 主站任何代码或数据，仅作为未来正式对接的设计依据。

## 第一期本地开发替代方案（已实现）

由于本次不接入真实 Supabase 项目与主站，Stage 04 使用以下方案模拟登录态，接口形状与未来正式方案保持一致：

- **会话载体**：单个 HttpOnly Cookie（`expectaly_session`，见 `src/lib/auth/session.ts`），值为 Base64URL 编码的 JSON，包含 `{ kind: "known", profileId }`（对应 `docs/DATABASE_SCHEMA.md` 中的演示 `profiles` 数据）或 `{ kind: "transient", profile: {...} }`（开发环境注册创建、不落库的临时账号）。
- **读取入口**：`getCurrentProfile()` 是唯一的会话读取函数，Server Component / 页面均通过它获取当前用户，不直接读取 Cookie。未来接入 Supabase Auth 时，只需替换此函数内部实现（改为读取 Supabase Session 并查询 `profiles` 表），调用方无需改动。
- **写入入口**：`src/lib/auth/actions.ts` 中的 Server Actions（`loginWithEmail`、`loginWithPhone`、`loginAsDemoProfile`、`registerDevAccount`、`logout`）。
- **路由保护**：`src/proxy.ts`（Next.js 16 中 `middleware` 已重命名为 `proxy`）拦截 `/account/**`，未登录时重定向到 `/auth/login?redirect=<原路径>`。
- **微信登录 / 主站 SSO 占位**：`src/app/auth/callback/route.ts` 按 `provider` 查询参数分支处理，未启用对应功能开关时统一重定向回登录页并提示「尚未开放」，不产生虚假的登录成功状态。

**重要限制**：该方案未做加密签名，仅用于本地开发与演示，不构成生产级身份验证，正式上线前必须替换为下方目标方案。

## 目标架构：共享账号推荐方案

评估以下三种方案后，推荐**方案二（共享同一个 Supabase 项目）**作为默认路径：

| 方案                                     | 说明                                                                                                                 | 优点                                 | 缺点                                              |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------- |
| 一、独立身份认证服务                     | 主站与商城各自的 Supabase 项目前置一个统一 Auth 网关                                                                 | 解耦彻底                             | 需要额外基础设施，短期投入大                      |
| **二、共享同一个 Supabase 项目（推荐）** | 商城直接复用主站的 Supabase 项目（同一 `auth.users` 与 `profiles` 表，或 `profiles` 增加 `site_scope`/角色区分字段） | 实现简单、天然共享会话、无需数据同步 | 商城与主站的部署/迁移需协调，数据库变更需双方评审 |
| 三、跨子域 SSO（各自数据库 + 令牌交换）  | 主站签发 JWT，商城通过 `/auth/callback?provider=main_site` 验证并建立本地会话                                        | 数据库独立、改动范围小               | 需要额外的令牌交换服务与密钥管理                  |

第一期 `mainSiteSsoEnabled` 功能开关（默认 `false`）已预留在 `src/lib/config/feature-flags.ts`，无论最终选择哪种方案，均通过该开关统一控制是否启用主站互通逻辑。

## Cookie 域策略

- 若采用方案二或三，登录态 Cookie 需设置 `Domain=.expectaly.com`，使 `expectaly.com` 与 `shop.expectaly.com` 共享。
- Cookie 属性：`Secure`（仅 HTTPS）、`HttpOnly`、`SameSite=Lax`（跨子域导航需要 `Lax` 而非 `Strict`，同时避免 CSRF 风险应保留在 `Lax` 而非 `None`）。
- 本地开发（`localhost`）无法使用真实的顶级域 Cookie 共享，第一期方案中的 `expectaly_session` 仅作用于 `shop.expectaly.com` 自身，符合预期。

## 跨子域安全

- 所有涉及登录状态变更的操作（登录、登出、注册）必须通过 Server Action 或 Route Handler 完成（当前实现已满足，`cookies().set/delete` 只能在这两类上下文中调用），不允许通过 GET 请求触发状态变更。
- 令牌交换类接口（`/auth/callback`）需要校验 `state` 参数防止 CSRF，正式接入 OAuth/SSO 时补充。
- 主站与商城之间的请求不应携带敏感参数于 URL 查询字符串中（参见项目安全总则）。

## 用户 ID 映射方案

- `Profile.mainSiteUserId` 字段（见 `src/types/user.ts`）已预留，用于记录该商城账号对应的主站用户 ID。
- 方案二（共享数据库）下，`mainSiteUserId` 与商城 `profiles.id` 实际为同一 UUID，此字段可省略或用于兼容迁移期间的双写场景。
- 方案三（独立数据库 + SSO）下，`mainSiteUserId` 是必需的映射键，商城首次通过主站 SSO 登录时应在此建立映射并落库。

## 角色同步机制

- 商城角色（`Role`，见 `src/types/roles.ts`）与主站角色体系相互独立：商城的 `merchant`/`admin` 等角色不应自动等同于主站角色。
- 若未来需要同步（如主站会员等级影响商城权益），建议由主站在角色变更时调用商城的内部 API（非本文档范围）显式更新 `user_roles` 表，而非商城反向拉取，保持单一数据源。

## 退出登录同步

- 方案二（共享数据库）：退出登录即销毁 Supabase Session，两侧天然同步。
- 方案三（独立数据库）：需要主站登出时通知商城使对应本地会话失效（如共享一个「登出事件」队列或短时黑名单），第一期不实现，仅记录为已知待办。

## 主站未接入时的本地开发替代方案（已落地，见上）

- 使用独立的模拟登录（本文档「第一期本地开发替代方案」一节）+ 独立本地 Supabase 项目（Stage 10 起接入时使用），不依赖主站可用性即可完成商城全部功能的开发与测试。
