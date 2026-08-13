# 测试清单（TEST_CHECKLIST）

> 状态：Stage 09 已完成。Vitest 单元测试（Stage 01 起）+ Playwright 端到端测试（Chromium / Firefox / Mobile Chrome 三项目）+ axe-core 自动化可访问性扫描均已就绪并纳入常规验证流程。

## Stage 00 手动验证记录

- [x] `npm run dev` 可正常启动，首页可访问
- [x] `npm run lint` 通过
- [x] `npm run build` 生产构建通过

## Stage 01 自动化测试

测试框架：Vitest（`vitest.config.ts`，`environment: "node"`，测试文件位于 `tests/unit/**/*.test.ts`）。

| 测试文件                                  | 覆盖内容                                                                                                       |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `tests/unit/permissions.test.ts`          | 权限矩阵 `can()` / `assertPermission()`：游客只读、商家自有资源、审核员专属操作、admin 与 super_admin 边界     |
| `tests/unit/pricing-service.test.ts`      | 汇率换算 `convertAmount()`：同币种直返、EUR→CNY 换算、缺失汇率对时返回 `NOT_FOUND`                             |
| `tests/unit/order-status-service.test.ts` | 订单状态机：自主交易与平台订单两套状态机的合法/非法迁移、跨 kind 迁移拒绝                                      |
| `tests/unit/inquiry-service.test.ts`      | 询价单状态机：标准流转路径、任意阶段取消、终态不可再迁移                                                       |
| `tests/unit/mock-data-integrity.test.ts`  | 种子数据引用完整性：外键一致性、`publisher_type`/`merchant_id` 不变式、受限制商品不得未审核直接上架、无重复 ID |
| `tests/unit/repositories.test.ts`         | Repository 层：按 slug/分类查询、未命中返回 `null` vs `NOT_FOUND` 的语义区分、媒体排序                         |
| `tests/unit/cart-service.test.ts`         | 购物车按商家分组逻辑：不同商家不合并分组、无购物车用户返回空摘要                                               |

运行方式：`npm run test`（单次）/ `npm run test:watch`（监听模式）。

Stage 08 新增 `tests/unit/compliance-service.test.ts`（风险关键词解析与匹配，6 个用例），单元测试总数 8 个文件 / 52 个用例。

## Stage 09：Playwright 端到端测试

测试框架：`@playwright/test`（`playwright.config.ts`，测试文件位于 `tests/e2e/**/*.spec.ts`），独立开发服务器端口 3101，覆盖三个项目：`chromium`、`firefox`、`mobile-chrome`（Pixel 5 设备预设；第一期未安装 WebKit 以控制安装体积，故未提供 Mobile Safari 项目）。

| 测试文件                                  | 覆盖内容                                                                                                 |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `tests/e2e/homepage.spec.ts`              | 首页加载、标题、无水平溢出                                                                               |
| `tests/e2e/auth-login.spec.ts`            | 路由保护重定向、演示账号登录、开放重定向防护、登出后再次拦截                                             |
| `tests/e2e/navigation-drawer.spec.ts`     | 移动端导航抽屉开关，验证关闭态不再拦截页面点击（对应 Drawer 组件真实缺陷修复）                           |
| `tests/e2e/discover-search.spec.ts`       | 商品发现页筛选/清除筛选、空状态、移动端筛选抽屉、搜索页跨类型结果                                        |
| `tests/e2e/product-detail.spec.ts`        | 已发布商品正常访问、未发布/不存在商品返回 404                                                            |
| `tests/e2e/cart-wishlist-inquiry.spec.ts` | 购物车分组展示与本地交互、收藏页路由保护、询价记录页                                                     |
| `tests/e2e/merchant-portal.spec.ts`       | 商家数据概览、非商家账号引导页、跨商家编辑商品 404 拦截、未登录重定向                                    |
| `tests/e2e/admin-portal.spec.ts`          | 非管理角色拦截、客服角色导航过滤、非超级管理员访问 `/admin/roles` 拦截、超级管理员权限矩阵、商品审核弹层 |
| `tests/e2e/compliance-gate.spec.ts`       | 受限制商品年龄确认门、地区限制自我声明与拦截、localStorage 持久化、举报风险关键词高亮                    |
| `tests/e2e/accessibility.spec.ts`         | axe-core 自动化扫描 9 个代表性页面模板，断言 serious/critical 级别零违规                                 |
| `tests/e2e/seo.spec.ts`                   | sitemap.xml/robots.txt 有效性、Product JSON-LD 结构化数据、canonical 链接                                |

运行方式：`npm run test:e2e`（全部项目）/ `npm run test:e2e:ui`（交互式 UI 模式）/ `npx playwright test --project=chromium <file>`（单项目单文件）。

### Stage 09 期间发现并修复的真实缺陷

- **Drawer 组件关闭态仍拦截点击**（影响移动端菜单、筛选抽屉）：`<dialog>` 元素未设置 `open` 属性时浏览器默认 `display:none`，但 Drawer 组件无条件应用 Tailwind `flex` 类覆盖了该默认值，导致关闭状态下仍占据布局并拦截其下方内容的点击事件。已改为按 `open` 状态切换 `flex flex-col` / `hidden`。此前该问题被本会话多次通过 JS `requestSubmit()` 绕过点击而未被察觉，是 Stage09 引入真实浏览器自动化测试后才被发现。
- **`text-ink-faint` 颜色对比度不达标**（WCAG AA）：`#9aa3af` 对 `paper`/白底/`surface-muted` 对比度仅 1.9~2.6:1（要求 4.5:1），影响全站页脚版权文字、法律文本版本说明等多处。调整为 `#65707d`（对三种背景均 ≥4.5:1）。
- **标题层级跳跃**（`heading-order`）：`ProductCard`/`BrandCard`/`MerchantCard`/城市专题列表页/Footer 栏目标题/受限制商品提示均使用 `<h3>` 直接跟在页面 `<h1>` 之后，缺少 `<h2>` 中间层级。统一调整为 `<h2>`。
- **登录页开放重定向（open redirect）**：详见 Stage 08 安全审查记录；Stage09 新增自动化回归测试防止再次引入。
- **商品详情页占位标签对比度**：`opacity-50` 叠加在已修复的 `ink-faint` 之上导致有效对比度再次跌破阈值，移除多余的 `opacity-50`。
- **公开页面普遍缺失 `<link rel="canonical">`**：为全部 19 个可索引公开页面模板（含动态详情页）补充 `alternates.canonical`。

## 性能与可访问性审查记录（Stage 09）

- 依赖体积：`clsx`、`lucide-react`（按需具名导入，可 tree-shaking）、`next`、`react`/`react-dom`、`tailwind-merge`，无重量级第三方库。
- 代码分割：`src/app/` 下仅 `internal/ui-kit` 一个页面标记 `"use client"`，其余全部路由为 Server Component，客户端交互下沉到叶子组件，符合 App Router 最佳实践。
- 字体加载：`next/font/google` 自托管 + `display: "swap"`，无渲染阻塞。
- 图片：当前全站为 `PlaceholderImage`（CSS 渐变占位），尚无真实图片资源，`next/image` 响应式优化留待接入 Supabase Storage 后实施。
- 可访问性：axe-core 全站 19 个页面模板扫描 0 violations（含 moderate 级别）。
