# 架构文档（ARCHITECTURE）

> 状态：Stage 01 已完成类型层、权限模型、功能开关、Repository/Service 数据访问层与 Supabase 迁移草案。

## 技术栈

- 框架：Next.js（App Router）+ TypeScript（严格模式）
- 样式：Tailwind CSS
- 组件参考：shadcn/ui 风格，去模板感定制
- 数据 / 认证：Supabase（PostgreSQL + Supabase Auth），本地开发阶段先用模拟数据层
- 表单与校验：React Hook Form + Zod
- 图标：Lucide Icons
- 多语言：next-intl（或同类方案）
- 测试：Vitest（单元/组件）+ Playwright（端到端）
- 包管理：npm（本机未安装 pnpm）

## 目录结构（Stage 01 实际状态）

```
src/
  app/                 # Next.js App Router 页面与路由
  components/
    ui/                # 基础 UI 组件（按钮、输入框等，Stage 02 建立）
    layout/            # Header/Footer/移动端菜单等布局组件（Stage 02 建立）
    product/            # 商品相关组件
    brand/              # 品牌相关组件
    merchant/            # 商家相关组件
    shared/              # 通用业务组件（空状态、加载态等）
  lib/
    repositories/       # Repository 模式数据访问层（ReadRepository<T> + 领域查询方法）
    services/            # 业务服务层（定价换算、购物车分组、询价/订单状态机、支付占位）
    errors/              # 统一错误类型 AppError、Result<T> 转换
    permissions/         # 权限矩阵（matrix.ts）与守卫函数（guards.ts）
    config/              # 功能开关（feature-flags.ts）、站点配置（site.ts）
    auth/                # 认证相关封装（Stage 04 建立）
    validation/          # Zod schema（Stage 04 起随表单逐步建立）
    utils/               # 工具函数
  types/                # 全局 TypeScript 类型定义（唯一类型来源）
  data/mock/             # 演示数据（品牌、商家、商品、订单、内容等，非真实商家授权）
  hooks/                # React hooks
  styles/               # 全局样式、设计变量
  i18n/messages/         # 多语言文案文件（Stage 03 起逐步建立）
supabase/migrations/     # 数据库迁移 SQL 草案（0001~0009，见 DATABASE_SCHEMA.md）
scripts/                 # 备份、安全检查等本地脚本
tests/
  unit/
  e2e/
docs/                    # 项目文档
```

## 分层原则

- **UI 层**（`components/`）只负责展示与交互，不直接访问数据源。
- **服务层**（`lib/services/`）承载业务逻辑（定价换算 `pricing-service.ts`、购物车按商家分组 `cart-service.ts`、询价/订单状态机 `inquiry-service.ts` / `order-status-service.ts`、支付占位 `payment-service.ts`），供页面和未来的 API Route 调用。
- **数据访问层**（`lib/repositories/`）封装对模拟数据 / 未来 Supabase 的访问，统一返回 `Result<T>`（成功/失败判别联合类型），对外暴露一致接口，方便后续无缝切换真实后端；通用只读实现见 `lib/repositories/base.ts` 的 `createInMemoryRepository<T>()`。
- **权限层**（`lib/permissions/`）在数据访问层和页面路由两处生效，不能只在前端隐藏按钮；`can()` 用于 UI 层判断，`assertPermission()` 用于服务端强制校验（无权限抛出 `AppError`）。
- **错误层**（`lib/errors/`）统一错误格式，服务函数内部 `throw new AppError(...)`，最外层转换为 `Result<T>` 的 `err()` 分支，页面层统一处理 loading / error / empty 状态。
- **类型层**（`types/`）作为唯一类型来源，避免重复定义；`src/types/index.ts` 统一导出。

## 功能开关（Feature Flags）

第一期功能开关（见 `src/lib/config/feature-flags.ts`，对应数据库 `system_settings` 表初始记录）：

- `paymentEnabled`（默认 `false`，即使置为 `true` 也无真实网关，见 PAYMENT_RESERVATION.md）
- `wechatLoginEnabled`（默认 `false`，未配置 `WECHAT_OAUTH_APP_ID`/`SECRET` 时前端给出友好提示）
- `mainSiteSsoEnabled`（默认 `false`，见 MAIN_SITE_INTEGRATION.md）

## 环境与部署

本地开发使用 `.env.local`（不入库），示例见根目录 `.env.example`。生产部署方案见 [DEPLOYMENT.md](./DEPLOYMENT.md)（Stage 10 补充）。
