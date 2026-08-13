# 项目进度文档（PROGRESS）

本文件记录各阶段的完成情况、验证结果与备份位置。严格按以下阶段顺序执行，每阶段完成、验证通过并成功备份后才进入下一阶段。

## 阶段列表

- [x] Stage 00：环境检查与项目初始化
- [x] Stage 01：架构、类型与模拟数据层
- [x] Stage 02：设计系统
- [x] Stage 03：公开用户页面
- [x] Stage 04：登录、用户中心与主站接口预留
- [x] Stage 05：商家入驻与商家后台
- [x] Stage 06：购物车、询价、订单和支付预留
- [x] Stage 07：平台管理后台
- [x] Stage 08：合规、限制商品和安全
- [x] Stage 09：完整测试与优化
- [x] Stage 10：发布准备

---

## 备份记录汇总

> 由 `scripts/backup-stage.ps1` 自动追加，最新记录在最上方。请勿手动改变 `BACKUP_LOG_START` / `BACKUP_LOG_END` 标记。

<!-- BACKUP_LOG_START -->

- [20260722-180226] 阶段 "stage-10-release-prep" 已备份至: D:\网页备份\意料之中-易购\stage-10-release-prep-20260722-180226

- [20260722-062015] 阶段 "stage-09-testing" 已备份至: D:\网页备份\意料之中-易购\stage-09-testing-20260722-062015

- [20260722-052637] 阶段 "stage-08-compliance" 已备份至: D:\网页备份\意料之中-易购\stage-08-compliance-20260722-052637

- [20260721-230015] 阶段 "stage-07-admin" 已备份至: D:\网页备份\意料之中-易购\stage-07-admin-20260721-230015

- [20260721-222836] 阶段 "stage-06-commerce" 已备份至: D:\网页备份\意料之中-易购\stage-06-commerce-20260721-222836

- [20260721-215909] 阶段 "stage-05-merchant" 已备份至: D:\网页备份\意料之中-易购\stage-05-merchant-20260721-215909

- [20260721-213246] 阶段 "stage-04-auth-users" 已备份至: D:\网页备份\意料之中-易购\stage-04-auth-users-20260721-213246

- [20260721-202646] 阶段 "stage-03-public-pages" 已备份至: D:\网页备份\意料之中-易购\stage-03-public-pages-20260721-202646

- [20260721-162942] 阶段 "stage-02-design-system" 已备份至: D:\网页备份\意料之中-易购\stage-02-design-system-20260721-162942

- [20260721-155536] 阶段 "stage-01-foundation" 已备份至: D:\网页备份\意料之中-易购\stage-01-foundation-20260721-155536

- [20260721-014704] 阶段 "stage-00-initial" 已备份至: D:\网页备份\意料之中-易购\stage-00-initial-20260721-014704

- [20260721-014623] 阶段 "stage-00-initial" 已备份至: D:\网页备份\意料之中-易购\stage-00-initial-20260721-014623

- [20260721-014502] 阶段 "stage-00-initial" 已备份至: D:\网页备份\意料之中-易购\stage-00-initial-20260721-014502

<!-- BACKUP_LOG_END -->

---

## Stage 00：环境检查与项目初始化

**目标**：搭建可运行的 Next.js + TypeScript + Tailwind 项目骨架，完成基础工具链配置、目录结构、文档骨架与备份机制。

### 已完成功能

- 使用 `create-next-app`（App Router + TypeScript + Tailwind + ESLint）生成项目骨架，`package.json` name 修正为 `expectaly-shop`
- 集成 Prettier（含 `prettier-plugin-tailwindcss`）与 `eslint-config-prettier`，`lint`/`format`/`typecheck` 脚本就绪
- 建立基础目录结构（`components`、`lib`（data/services/repositories/auth/permissions/validation/utils/config）、`types`、`data/mock`、`hooks`、`styles`、`i18n/messages`、`supabase/migrations`、`scripts`、`tests`、`docs`）
- 创建全部 11 份 docs 骨架文档
- 创建 `.env.example`（无真实密钥）
- 创建安全检查脚本 `scripts/safety-check.ps1` 与备份脚本 `scripts/backup-stage.ps1`
- 编写项目 README

### 主要文件

- `package.json`、`tsconfig.json`、`eslint.config.mjs`、`.prettierrc.json`
- `src/app/layout.tsx`、`src/app/page.tsx`
- `docs/*.md`（11 份）
- `.env.example`
- `scripts/backup-stage.ps1`、`scripts/safety-check.ps1`
- `README.md`

### 测试结果

- `npm run lint`：通过，无警告或错误
- `npm run typecheck`：通过
- `npm run build`：通过（Next.js 16.2.10 + Turbopack，`/` 与 `/_not-found` 均预渲染为静态页面）
- 开发服务器（`npm run dev`）手动验证：首页可访问，标题与占位文案正确渲染
- 尚无自动化测试（Vitest/Playwright 将从 Stage 01 起引入）

### 已知问题

- 无（`create-next-app` 自动生成了 `AGENTS.md`/`CLAUDE.md`，提示 Next.js 16 相对训练数据存在破坏性变更，后续阶段涉及路由/服务端新特性时会先查阅 `node_modules/next/dist/docs/` 确认最新用法）

### 备份记录

见文首「备份记录汇总」。本阶段最终备份路径：`D:\网页备份\意料之中-易购\stage-00-initial-20260721-014704`

### 下一阶段

Stage 01：架构、类型与模拟数据层 —— 建立核心 TypeScript 类型、角色与权限模型、Repository/Service 数据访问层、功能开关、演示数据与数据库架构文档细化。

---

## Stage 01：架构、类型与模拟数据层

**目标**：建立唯一类型来源、角色与权限矩阵、统一错误格式与功能开关、Repository/Service 数据访问层、高质量演示数据、Supabase 迁移 SQL 草案，并引入 Vitest 单元测试基础设施。

### 已完成功能

- **类型层**（`src/types/`，21 个文件 + `index.ts` 统一导出）：覆盖 `docs/DATABASE_SCHEMA.md` 中规划的全部 ~45 个实体（`profiles`、`user_roles`、`merchants`、`products`、`orders`、`payments`、`reviews`、`reports`、`notifications`、`content_pages` 等），统一 `BaseEntity`（id / 时间戳 / 软删除 / 审计字段）基础形状，`LocalizedText` 多语言字段、`Money`/`Currency` 值对象、`Result<T>` 统一返回类型
- **角色与权限模型**（`src/lib/permissions/`）：11 个角色的权限矩阵（`matrix.ts`）、`can()` / `assertPermission()` / `assertOwnsResource()` 等守卫函数（`guards.ts`），`docs/ROLES_AND_PERMISSIONS.md` 已更新为实际实现文档
- **统一错误格式**（`src/lib/errors/app-error.ts`）：`AppError` 类 + `AppErrorCode` 枚举 + `toAppErrorShape()` 转换函数
- **功能开关**（`src/lib/config/feature-flags.ts`）：`paymentEnabled` / `wechatLoginEnabled` / `mainSiteSsoEnabled`，全部默认关闭，从环境变量读取且未配置凭证时强制保持关闭
- **演示数据**（`src/data/mock/`，21 个文件）：6 个品牌（Favilli、Humilis、Milano Atelier、Torino Objects、Firenze Piccoli、Modena Collectors）、5 个商家、12 个分类、10 个交易标签、11 个商品（含 1 个受限制的雪茄商品演示合规审核流程）、订单、询价、购物车、意向清单、拼单、预订、评价、举报、通知、代购需求、11 份法律文本模板、5 份平台说明内容页、4 个专题策展、10 个城市指南、6 条 FAQ、覆盖全部 11 种角色的演示账号
- **Repository / Service 数据访问层**（`src/lib/repositories/`、`src/lib/services/`）：通用只读接口 `ReadRepository<T>` + `createInMemoryRepository<T>()` 工厂（`base.ts`），16 个领域 repository；服务层实现汇率换算（`pricing-service.ts`）、购物车按商家分组（`cart-service.ts`）、询价与订单状态机校验（`inquiry-service.ts` / `order-status-service.ts`）、支付占位实现（`payment-service.ts`，统一抛出 `FEATURE_DISABLED`）
- **Supabase 迁移 SQL 草案**（`supabase/migrations/0001~0009`）：按依赖顺序建表，覆盖全部规划实体，统一软删除/审计字段约定，`docs/DATABASE_SCHEMA.md` 已更新为完整设计文档
- **Vitest 单元测试**（`tests/unit/`，7 个文件，43 个用例）：权限矩阵、汇率换算、订单/询价状态机、种子数据引用完整性、Repository 查询、购物车分组逻辑

### 主要文件

- `src/types/*.ts`（21 个文件）
- `src/lib/permissions/`、`src/lib/errors/`、`src/lib/config/`
- `src/lib/repositories/*.ts`（17 个文件）、`src/lib/services/*.ts`（6 个文件）
- `src/data/mock/*.ts`（21 个文件）
- `supabase/migrations/0001_extensions_and_core.sql` ~ `0009_trust_safety_and_settings.sql`
- `tests/unit/*.test.ts`（7 个文件）、`vitest.config.ts`
- `docs/DATABASE_SCHEMA.md`、`docs/ROLES_AND_PERMISSIONS.md`、`docs/ARCHITECTURE.md`、`docs/PAYMENT_RESERVATION.md`、`docs/TEST_CHECKLIST.md`（均已更新为实际实现内容）
- `eslint.config.mjs`（新增 `argsIgnorePattern`/`varsIgnorePattern` 规则，支持接口占位实现的下划线未使用参数）

### 测试结果

- `npm run lint`：通过，无警告或错误
- `npm run typecheck`：通过
- `npm run test`（Vitest）：7 个测试文件、43 个用例全部通过
- `npm run build`：通过（Next.js 16.2.10 + Turbopack）

### 已知问题

- `npm audit` 报告 2 个 moderate 级别漏洞（`postcss` via `next` 的传递依赖），修复需要将 `next` 降级到 `9.3.3`（重大breaking change），判断为不应在本阶段处理，留待后续 Next.js 版本升级时一并解决
- 尚未连接真实 Supabase 项目，`supabase/migrations/` 为 SQL 草案，尚未执行；RLS 策略留待 Stage 08 编写
- 尚无 UI 组件与页面消费这些类型/数据（属于 Stage 02 起的工作范围）

### 备份记录

见文首「备份记录汇总」。

---

## Stage 02：设计系统

**目标**：参考主站 expectaly.com 的视觉语言建立设计 Token（色彩/字体/圆角/阴影/断点），并搭建 Header/Footer/移动端菜单、基础 UI 组件与商品/品牌/商家业务卡片，确保无淘宝感与模板感。

### 已完成功能

- **设计 Token**（`src/app/globals.css`，Tailwind v4 `@theme`）：色彩（暖白背景 `paper`、墨色文字 `ink`、低饱和深青绿强调色 `brand-50/100/700/900`、语义状态色 `success/warning/danger`）、字体（中文系统无衬线字体栈 + 英文衬线字体 `Source Serif 4`）、圆角（`xs/sm/md`，最大 6px）、阴影（仅 `shadow-overlay` 用于浮层，卡片零阴影）、断点（360/640/768/1024/1280/1536）、容器最大宽度（1440px）。配色实测取自 expectaly.com 主站计算样式，保持「意料之中」品牌体系视觉连贯性
- **字体与根布局**：`next/font/google` 加载 `Source Serif 4`（`--font-serif-override`），`layout.tsx` 接入 `Header`/`Footer`
- **基础 UI 组件**（`src/components/ui/`）：`Button`（4 variant × 3 size，含 loading/disabled）、`Input`/`Textarea`/`Select`（内置 label/description/error，`aria-invalid`/`aria-describedby` 关联）、`Badge`（7 种语义 tone）、`Dialog`/`Drawer`（基于原生 `<dialog>` 元素，浏览器原生焦点锁定 + Esc 关闭，无需额外弹层库）
- **Header / Footer / 移动端菜单**（`src/components/layout/`）：极简顶部导航（Logo + 主导航 + 搜索/用户中心/购物车入口）、移动端汉堡菜单抽屉、完整页脚（探索/服务/帮助/法律四列 + 语言切换 + 主站入口链接）、文字版 Logo 占位、语言切换器占位（仅简体中文可用，其余「即将支持」）
- **业务卡片组件**：`ProductCard`（含交易标签、收藏按钮、售罄降低透明度）、`BrandCard`、`MerchantCard`（含认证徽章、评分）、`Price`（按 `displayMode` 渲染双货币/参考价/询价，含汇率换算免责声明）、`ProductTagBadge`（10 种交易标签的语义色映射）
- **状态与布局组件**：`EmptyState`、`ErrorState`（含重试按钮）、`Skeleton`/`ProductCardSkeleton`（骨架屏，遵循 `prefers-reduced-motion`）、`PageContainer`、`Grid`（响应式网格，移动端 2 列起步）
- **图片占位方案**：`PlaceholderImage` 组件（渐变色块 + 图标），替代尚未接入的真实图片资源，避免 404 图片或廉价占位图标
- **内部 UI 展示页**（`/internal/ui-kit`，`noindex`）：汇总以上全部组件与真实模拟数据联调展示，作为设计系统的内部验收页面
- 新增依赖：`clsx`、`tailwind-merge`（className 合并）、`lucide-react`（图标）
- 响应式与可访问性验证：桌面/移动断点下导航折叠正确、无水平溢出；`Dialog`/`Drawer` 的 Esc 关闭与焦点锁定逻辑通过浏览器实测验证（原生 `cancel` 事件触发关闭）；卡片/按钮圆角与阴影计算样式核实符合设计规范（2px/4px 圆角、零阴影）

### 主要文件

- `src/app/globals.css`（设计 Token）、`src/app/layout.tsx`
- `src/components/ui/{Button,Input,Textarea,Select,Badge,Dialog,Drawer}.tsx`
- `src/components/layout/{Header,Footer,Logo,LanguageSwitcher,MobileMenu,nav-links}.tsx`
- `src/components/product/{ProductCard,Price,ProductTagBadge}.tsx`
- `src/components/brand/BrandCard.tsx`、`src/components/merchant/MerchantCard.tsx`
- `src/components/shared/{PlaceholderImage,EmptyState,ErrorState,Skeleton,PageContainer,Grid}.tsx`
- `src/app/internal/{layout.tsx,ui-kit/page.tsx}`
- `src/lib/utils/cn.ts`
- `.claude/launch.json`（本地预览用 dev server 配置，端口 3100）

### 测试结果

- `npm run lint`：通过，无警告或错误
- `npm run typecheck`：通过
- `npm run test`（Vitest）：7 个测试文件、43 个用例全部通过（未受设计系统改动影响）
- `npm run build`：通过（Next.js 16.2.10 + Turbopack，新增 `/internal/ui-kit` 静态路由）
- `npm run format:check`：首次运行发现历史文件（Stage 00/01 遗留）未格式化，已执行 `npm run format` 统一修复，复检通过
- 浏览器实测：`/` 与 `/internal/ui-kit` 均可正常访问，桌面端（1280px）与移动端（375px）断点下导航、抽屉菜单交互正常，控制台无报错

### 已知问题

- 本次会话的浏览器截图工具持续超时（对内部页面与外部站点均如此），判断为环境级问题；已改用无障碍树读取（`read_page`）与计算样式检查（`javascript_tool`）完成视觉/交互验证，未发现实际渲染问题
- 商品/品牌/商家图片资源使用渐变占位块，尚未接入真实图片或 Supabase Storage（按计划留待后续阶段）
- 语言切换器、搜索入口等交互目前均为纯 UI 占位，尚未接入实际路由页面（Stage 03 起补齐）

### 备份记录

见文首「备份记录汇总」。

### 下一阶段

Stage 03：公开用户页面 —— 首页、商品发现页、商品详情页、品牌/商家列表与详情、城市选品、专题策展、搜索页、自定义代购页、平台说明与法律页面，接入 SEO 元数据与多语言文案文件。

---

## Stage 03：公开用户页面

**目标**：基于 Stage 01 数据层与 Stage 02 设计系统，实现全部公开用户页面，接入 SEO 元数据、结构化数据、sitemap/robots。

### 已完成功能

- **首页**（`/`）：编辑精选式分区（品牌首屏、本期精选、热门类别、新到商品、专题策展、买手推荐、品牌故事、限量收藏、城市选品、预订拼单专区、代购入口、平台服务说明、用户评价、FAQ 预览），每区仅展示少量精选内容
- **商品发现页 + 分类页**（`/discover`、`/categories/[slug]`）：搜索、分类/品牌/商家/城市/交易标签/价格区间筛选、6 种排序方式、网格/列表视图切换、移动端筛选抽屉（复用 Stage 02 Drawer）、无结果空状态、清除全部筛选；分类页重定向到发现页并预置筛选条件，避免维护两套列表 UI
- **商品详情页**（`/products/[slug]`）：图库占位（含视频/360° 展示预留位）、面包屑、价格（双货币+汇率免责声明）、规格库存、采购信息、费用标签、按 `tradeModes` 动态渲染的操作面板（联系商家/人工询价/预订/拼单/代购需求，站内表单为界面交互演示）、品牌与商品故事、用户评价、同品牌/相似商品、售后免责声明、举报入口；未发布/待审核商品返回 404
- **品牌与商家页面**（`/brands`、`/brands/[slug]`、`/merchants`、`/merchants/[slug]`）：品牌故事与相关商品、商家认证徽章/评分/联系方式/售后规则/在售商品/用户评价/举报入口
- **城市与专题页面**（`/cities`、`/cities/[slug]`、`/editorial`、`/editorial/[slug]`）：城市详情聚合当地品牌/商家/商品；专题详情解析 `editorial_collection_items` 混合展示商品/品牌/商家
- **搜索页**（`/search`）：跨商品/品牌/商家/城市/专题联合搜索，`SearchBar` 组件含 localStorage 搜索历史与热门搜索标签
- **自定义代购页**（`/custom-purchase`）：完整表单（商品名称/品牌/参考链接/截图/规格/数量/收货城市/期望时间/预算/可见范围/接受类似款/平台担保意向/备注），提交为本地确认演示，未接入后端持久化
- **平台说明类页面**：`/about`、`/how-it-works`（含流程步骤图示）、`/merchant-apply`（入驻要求/权益说明，在线申请入口标注「即将开放」）、`/faq`（按分类分组的手风琴交互）
- **法律页面**（`/legal/[slug]`）：11 篇法律文本模板全部通过 `generateStaticParams` 静态生成，含「待法律顾问审核」提示横幅
- **年龄确认与举报组件**：`AgeConfirmationGate`（受限制商品分类的年龄确认交互，Stage 08 将接入持久化与地区限制）、`ReportDialog`（商品/商家通用举报入口）
- **SEO**：根布局 `metadataBase` + Open Graph/Twitter Card 默认值 + 标题模板；各页面 `generateMetadata`；`app/sitemap.ts`（静态路由 + 全部动态实体）、`app/robots.ts`；商品/品牌/商家详情页注入 JSON-LD 结构化数据（`Product`/`Brand`/`Organization`）
- **响应式与链接完整性验证**：桌面（1280px）与移动端（375px）断点下 discover/product/homepage 均无横向溢出；抓取首页全部内部链接（44 条唯一路径）逐一请求验证均返回 200

### 主要文件

- `src/app/{page.tsx,discover,products/[slug],categories/[slug],brands,brands/[slug],merchants,merchants/[slug],cities,cities/[slug],editorial,editorial/[slug],search,custom-purchase,about,how-it-works,merchant-apply,faq,legal/[slug]}`
- `src/app/{sitemap.ts,robots.ts}`
- `src/components/product/{ProductListRow,MobileFilterDrawer,ProductActionsPanel}.tsx`
- `src/components/shared/{SectionHeading,ReportDialog,AgeConfirmationGate,SearchBar,CustomPurchaseForm,FaqAccordion,JsonLd}.tsx`
- `src/lib/services/product-view.ts`（`attachProductTags` 共享工具）
- `src/lib/repositories/product-repository.ts`（新增 `getTagKeys` 便捷方法）
- `src/components/ui/Button.tsx`（新增 `buttonClasses` 导出，供「链接型 CTA」复用按钮样式而不嵌套非法 HTML）
- `docs/ROUTES.md`（更新为实际实现状态）

### 测试结果

- `npm run lint`：通过，无警告或错误
- `npm run typecheck`：通过
- `npm run test`（Vitest）：7 个测试文件、43 个用例全部通过（未受页面改动影响）
- `npm run build`：通过（Next.js 16.2.10 + Turbopack；11 篇法律文本静态预渲染，商品/品牌/商家/城市/专题/发现页/搜索页为按需动态渲染）
- `npm run format` / `format:check`：通过
- 浏览器实测：首页、发现页（含筛选/排序/空状态）、商品详情（含受限商品 404 校验）、品牌/商家/城市/专题详情、搜索（含结果分组）、自定义代购表单均手动验证渲染正确、控制台无报错；`sitemap.xml`/`robots.txt` 请求返回 200 且内容正确

### 已知问题

- 发现一处真实缺陷并已修复：根布局标题模板（`%s | 站点名`）与各页面 `metadata.title` 中手动拼接的站点名后缀重复导致标题重复展示（如「商品发现 \| 意料之中～意购 \| 意料之中～意购」），已移除全部 19 处页面级标题中的手动后缀
- 购物车/收藏/用户中心相关导航入口已存在但对应页面尚未实现（按计划属于 Stage 04/06 范围），直接访问会 404，属预期行为
- 多语言文案文件（next-intl messages）尚未接入，当前页面文案为硬编码简体中文（按计划将在多语言方案选型后于后续阶段补齐，不影响第一期简体中文可用性要求）
- 图片仍为占位渐变块，尚未接入真实图片资源

### 备份记录

见文首「备份记录汇总」。

### 下一阶段

Stage 04：登录、用户中心与主站接口预留 —— 登录/注册页、Supabase Auth 接入、微信登录占位、用户中心（订单/询价/代购/收藏/浏览历史/通知/地址/评价/设置）、路由保护与权限测试。

---

## Stage 04：登录、用户中心与主站接口预留

**目标**：搭建开发环境模拟登录体系（邮箱/手机号/演示账号/微信占位）、Next.js 16 `proxy.ts` 路由保护、完整用户中心十个子页面，并落地主站账号互通的目标架构文档。

### 已完成功能

- **Auth 会话层**（`src/lib/auth/`）：`session.ts` 提供唯一的 `getCurrentProfile()` 读取入口（Cookie 承载 `{kind:"known",profileId}` 或 `{kind:"transient",profile}`，未加密签名，仅限开发环境使用）；`actions.ts`（`"use server"`）提供 `loginWithEmail`/`loginWithPhone`/`loginAsDemoProfile`/`registerDevAccount`/`logout` 五个 Server Actions；`types.ts` 独立存放 `AuthActionState`/`DEV_SMS_CODE`（`"use server"` 文件的导出必须全部是异步函数，不能与非函数值混合导出，这一 Next.js 限制在实现过程中被发现并修正）
- **登录页**（`/auth/login`）：邮箱/手机号双 Tab、手机号验证码为开发环境固定值（`123456`，明确提示未接入真实短信网关）、微信登录按钮按 `wechatLoginEnabled` 开关禁用并提示、覆盖全部 11 种角色的演示账号快捷登录（`<details>` 折叠面板）、已登录时自动重定向
- **注册页**（`/auth/register`）：开发环境临时账号注册，仅写入会话 Cookie，不落库，明确提示不影响正式用户数据
- **OAuth 回调骨架**（`/auth/callback`，Route Handler）：按 `provider` 查询参数分支（`wechat`/`main_site`），未启用对应功能开关时统一友好跳转回登录页，不产生虚假登录成功状态
- **路由保护**（`src/proxy.ts`）：Next.js 16 中 `middleware` 已重命名为 `proxy`（开发阶段查阅 `node_modules/next/dist/docs` 确认新约定后采用），拦截 `/account/**`，未登录重定向到 `/auth/login?redirect=<原路径>` 并在浏览器实测验证
- **用户中心布局**（`/account/layout.tsx`）：服务端二次校验登录态、侧边导航（`AccountNav`，高亮当前路由）、退出登录（Server Action 表单）
- **用户中心十个子页面**：概览（订单/询价/代购/收藏/未读通知统计卡片）、我的订单（区分平台订单/自主交易，状态徽章）、询价记录、代购申请、我的收藏、浏览历史（本地 `localStorage` 记录，数据库无对应实体，`BrowsingHistoryRecorder` 挂载于商品详情页）、消息通知、地址管理（新增地址弹层为界面演示）、我的评价（商品评价+商家评价，区分已验证购买）、账号设置（资料/语言/隐私偏好，界面演示）
- **主站账号互通文档**（`docs/MAIN_SITE_INTEGRATION.md`）：完整重写，记录第一期本地开发替代方案的实际实现、三种目标架构方案对比（推荐共享 Supabase 项目）、Cookie 域策略、跨子域安全、用户 ID 映射、角色同步、退出登录同步
- **浏览器实测**：路由保护重定向（含 `redirect` 参数）、邮箱登录、演示账号快捷登录、登出、账号中心统计数据聚合（张明账号：2 订单/1 询价/2 收藏/1 未读通知，与种子数据一致）、订单/询价/收藏/评价/通知/地址/设置/浏览历史页面全部手动验证渲染正确、控制台无报错

### 主要文件

- `src/lib/auth/{session,actions,types}.ts`
- `src/proxy.ts`
- `src/app/auth/{login,register}/page.tsx`、`src/app/auth/callback/route.ts`
- `src/components/auth/{LoginForm,RegisterForm}.tsx`
- `src/app/account/{layout,page}.tsx`、`src/app/account/{orders,inquiries,custom-purchases,wishlist,history,notifications,addresses,reviews,settings}/page.tsx`
- `src/components/account/{AccountNav,BrowsingHistoryList,AddAddressDialog,SettingsForm}.tsx`
- `src/components/product/BrowsingHistoryRecorder.tsx`
- `src/lib/services/order-view.ts`（订单状态标签/语义色映射）
- `src/lib/repositories/user-repository.ts`（新增 `findByPhone`，`findByEmail` 改为大小写不敏感）、`review-repository.ts`（新增 `merchantReviewRepository.findByUser`）
- `docs/MAIN_SITE_INTEGRATION.md`、`docs/ROUTES.md`（更新为实际实现状态）
- 新增依赖：`server-only`

### 测试结果

- `npm run lint`：通过，无警告或错误
- `npm run typecheck`：通过
- `npm run test`（Vitest）：7 个测试文件、43 个用例全部通过（未受本阶段改动影响）
- `npm run build`：通过（Next.js 16.2.10 + Turbopack；构建输出确认 `ƒ Proxy (Middleware)` 已生效，`/account/**` 全部为按需动态渲染）
- `npm run format`：通过
- 浏览器实测：见上「已完成功能」末尾

### 已知问题

- 发现并修复一处真实缺陷：`/account` 布局的 `metadata.title` 使用纯字符串会阻断根布局的标题模板继承，导致子页面标题丢失站点名后缀；已改为 `{default, template}` 形式的嵌套模板（`%s | 用户中心 · 意料之中～意购`）
- 发现并修复一处真实缺陷：`lib/auth/actions.ts`（`"use server"` 文件）中混合导出了非函数值（`DEV_SMS_CODE` 常量、`AuthActionState` 接口），导致 Next.js 构建时报「模块没有任何导出」；已将常量与类型移至独立的 `lib/auth/types.ts`
- 当前会话方案（Cookie 未签名）仅适用于开发环境，正式上线前必须替换为 Supabase Auth（`docs/MAIN_SITE_INTEGRATION.md` 已记录迁移路径，`getCurrentProfile()` 签名保持稳定以便无缝切换）
- 地址新增、账号设置保存、浏览历史（本地存储）均为界面交互演示，尚未接入真实持久化，将在 Stage 06（购物车/订单）及后续阶段结合真实数据库读写逐步补齐
- 商家入驻申请表单、商家后台、平台后台的权限路由保护尚未接入（按计划属于 Stage 05/07 范围）

### 备份记录

见文首「备份记录汇总」。

### 下一阶段

Stage 05：商家入驻与商家后台 —— 商家入驻申请表单、商家后台布局、商品管理（新增/编辑/草稿/审核状态）、库存与规格管理、询价管理、自主交易记录、代购进度、拼单预订管理、店铺内容发布、数据统计、商家权限校验。

---

## Stage 05：商家入驻与商家后台

**目标**：补全商家入驻在线申请流程，搭建完整商家后台（14 个路由），并建立账号 → 商家的权限解析与跨商家数据隔离。

### 已完成功能

- **商家成员关系数据**：新增 `mockMerchantMembers` 演示数据与 `merchantMemberRepository`（`findByUser`/`findByMerchant`），`lib/services/merchant-context.ts` 的 `getManagedMerchant(profileId)` 是唯一的「账号 → 所管理商家」解析入口
- **商家入驻申请**（`/merchant-apply`）：按登录状态分三种展示——未登录显示「登录后申请」引导；已登录且已有申请显示状态卡片（`draft/submitted/in_review/needs_more_info/approved/rejected` 六态徽章 + 审核意见，浏览器实测陈曦账号的「需补充资料」状态正确展示）；已登录且未申请显示完整在线申请表单（主体类型/联系方式/主营类别/资质材料/采购能力/售后规则等），提交为界面演示确认
- **商家后台布局**（`/merchant/layout.tsx`）：`proxy.ts` 新增 `/merchant/:path*` 匹配；布局内二次校验 `can(profile.roles, "product:update_own") && managedMerchant`，不满足时展示「你还不是认证商家」引导页而非报错，浏览器实测非商家账号访问时正确展示引导、商家账号访问时正确展示后台
- **数据概览**（`/merchant`）：商品状态统计（已发布/待审核/草稿）、待回复询价数、订单总数、进行中拼单数，浏览器实测 Milano Atelier 账号数据与种子数据一致（3 已发布商品、1 订单）
- **商品管理**：列表（状态徽章）、新建、编辑（**服务端校验商品 `merchantId` 归属，非本商家商品统一返回 404**，浏览器实测尝试编辑 Modena Collectors 的法拉利车模被正确拦截）；表单覆盖名称/分类/品牌/简介/故事/材质/尺寸/采购地/价格与费用/交易方式（多选）/库存/受限制商品标记
- **询价 / 订单 / 拼单 / 预订管理**：均按 `merchantId` 过滤，询价管理提供回复报价弹层（界面演示）
- **店铺资料 / 认证资料 / 内容管理 / 评价管理 / 数据统计 / 账号安全**：店铺资料编辑表单；认证等级展示 + 补充材料上传占位；采购现场内容发布（界面演示）；商品评价 + 店铺评价列表；数据统计（浏览量/收藏量/订单数/评分 + 商品浏览量条形排行）；团队成员列表（`merchant_members`）
- **测试补充**：`tests/unit/mock-data-integrity.test.ts` 新增商家成员关系的外键完整性校验（44 个用例）

### 主要文件

- `src/data/mock/merchant-members.ts`
- `src/lib/repositories/merchant-repository.ts`（新增 `merchantMemberRepository`）
- `src/lib/services/{merchant-context,product-view（新增商品状态标签/语义色）}.ts`
- `src/proxy.ts`（新增 `/merchant/:path*` 匹配）
- `src/components/merchant-apply/MerchantApplicationForm.tsx`
- `src/app/merchant-apply/page.tsx`（重写，接入登录态与申请状态分支）
- `src/app/merchant/{layout,page}.tsx`
- `src/app/merchant/products/{page,new/page,[id]/edit/page}.tsx`
- `src/app/merchant/{inquiries,orders,group-buys,preorders,store,verification,content,reviews,analytics,settings}/page.tsx`
- `src/components/merchant/{MerchantNav,ProductForm,InquiryReplyDialog,StoreProfileForm,PublishContentForm}.tsx`

### 测试结果

- `npm run lint`：通过，无警告或错误
- `npm run typecheck`：通过
- `npm run test`（Vitest）：7 个测试文件、44 个用例全部通过
- `npm run build`：通过（Next.js 16.2.10 + Turbopack；14 个 `/merchant/**` 路由 + `/merchant-apply` 全部按需动态渲染）
- 浏览器实测：非商家账号访问 `/merchant` 展示引导页；商家账号（Milano Atelier）访问后台数据概览/商品列表/编辑/数据统计均渲染正确；**跨商家商品编辑越权访问被服务端正确拦截并返回 404**；商家入驻申请三种状态分支全部验证；控制台全程无报错

### 已知问题

- 商品新增/编辑、店铺资料保存、询价回复、内容发布均为界面交互演示，尚未接入真实数据库写入（一致地延续 Stage 03/04 已建立的模式），将在真实 Supabase 项目接入后统一补齐
- 商品图片、认证材料、微信二维码等文件上传均为占位 `<input type="file">`，未接入 Supabase Storage
- 平台后台（商品审核/商家审核）尚未实现，商家提交的申请与商品当前只能通过预置的种子数据模拟「已审核通过」状态（按计划属于 Stage 07 范围）

### 备份记录

见文首「备份记录汇总」。

### 下一阶段

Stage 06：购物车、询价、订单和支付预留 —— 购物车按商家分组结算页、询价用户侧全流程、平台订单状态机 UI、代购进度时间线、拼单/预订用户侧交互、支付功能开关的前端提示完善。

---

## Stage 06：购物车、询价、订单和支付预留

**目标**：补齐购物车页面、订单详情与代购进度时间线可视化、账户订单页的拼单/预订汇总展示，并对支付预留的一致性做全站审查。

### 已完成功能

- **购物车页面**（`/cart`）：直接复用 Stage 01 的 `getCartSummary()` 服务层（按商家分组、`requiresManualInquiry`/`hasPlatformCheckoutCapableItems` 判定），页面按商家渲染分组卡片，明确提示「不同商家的商品分开结算，暂不支持合并支付」；`CartLineItem`（数量 +/- 、移入收藏、删除+撤销，均为本地状态演示）、`BatchInquiryDialog`（批量询价弹层）；受 `proxy.ts` 路由保护（新增 `/cart` 匹配）
- **订单详情页**（`/account/orders/[id]`）：服务端校验订单 `userId` 归属（非本人订单返回 404）；`PurchaseProgressTimeline` 组件可视化代购进度阶段（已达成阶段打勾、未达成显示序号，衔接线随进度变色），与 `OrderStatusHistoryList`（系统状态审计轨迹）分开展示，符合 `docs/DATABASE_SCHEMA.md` 中「面向用户的进度时间线与系统审计轨迹分离」的设计原则
- **账户订单页扩展**（`/account/orders`）：新增「我参与的拼单」（按 `group_buy_members` 反查用户参与的拼单及当前成团进度）与「我的预订」（`preorderRepository.findByUser`）两个分区，订单列表项现在链接到订单详情页
- **支付预留一致性审查**：全仓库检索确认 `unconfiguredPaymentProvider` 在任意 `paymentEnabled` 状态下均抛出 `FEATURE_DISABLED`（不存在真实网关兜底）；`platform_checkout` 交易方式在商品详情页、购物车页均展示为禁用态 + `PAYMENT_DISABLED_NOTICE`；未发现任何硬编码的「支付成功」文案或可达的结算/支付路由，审查结论为通过，无需整改
- **浏览器实测**：购物车按商家正确分组（Torino Objects / Chiara 两组）、数量调整、删除+撤销交互正确；订单列表显示 2 个订单 + 1 个拼单参与记录；平台订单详情页代购进度时间线正确渲染已完成/进行中/未来阶段（含 mock 数据中「意大利境内运输」阶段无记录但按时间线逻辑正确顺延为已达成的边界情况）；控制台全程无报错

### 主要文件

- `src/app/cart/page.tsx`
- `src/components/cart/{CartLineItem,BatchInquiryDialog}.tsx`
- `src/app/account/orders/{page.tsx,[id]/page.tsx}`
- `src/components/account/{PurchaseProgressTimeline,OrderStatusHistoryList}.tsx`
- `src/proxy.ts`（新增 `/cart` 匹配）

### 测试结果

- `npm run lint`：通过，无警告或错误
- `npm run typecheck`：通过
- `npm run test`（Vitest）：7 个测试文件、44 个用例全部通过
- `npm run build`：通过（Next.js 16.2.10 + Turbopack；`/cart`、`/account/orders/[id]` 均按需动态渲染）
- 浏览器实测：见上「已完成功能」末尾

### 已知问题

- 购物车数量调整、删除、批量询价均为本地界面演示，刷新后状态不保留（尚未接入 `cart_items` 表真实写入）
- 拼单/预订暂无独立的账户子路由，按 ROUTES.md 现状并入 `/account/orders` 页面展示，避免创建规划外的新路由
- 平台后台（商品/商家审核、举报处理等）尚未实现，属 Stage 07 范围

### 备份记录

见文首「备份记录汇总」。

### 下一阶段

Stage 07：平台管理后台 —— 后台布局、仪表盘、用户管理、商家审核、商品审核、订单/询价/代购需求管理、举报处理、内容管理、城市/专题管理、法律文本管理、汇率与功能开关设置、角色权限与操作日志。

---

## Stage 07：平台管理后台

**目标**：搭建覆盖全部 7 种后台角色（platform_operator / content_editor / customer_service / product_reviewer / merchant_reviewer / admin / super_admin）的平台管理后台，实现按角色权限动态过滤的导航与仪表盘，补齐审计日志与系统设置数据层。

### 已完成功能

- **审计日志与系统设置数据层**：新增 `AuditLog`/`SystemSetting` 演示数据（`mockAuditLogs`、`mockSystemSettings`）与对应 `auditLogRepository`（含 `findRecent()`）、`systemSettingRepository`（含 `findByKey()`）；`tests/unit/mock-data-integrity.test.ts` 新增审计日志引用完整性与系统设置键唯一性校验（46 个用例）
- **平台后台布局与导航**（`/admin/layout.tsx`、`src/components/admin/AdminNav.tsx`）：服务端校验账号是否拥有至少一个平台后台角色，否则展示「无权访问平台后台」引导页而非报错；`AdminNav` 按每个导航项声明的 `anyOf: PermissionKey[]` 与 `can()` 动态过滤，不同角色登录后仅看到自己权限范围内的导航项（浏览器实测：客服账号仅见仪表盘/用户管理/订单管理/询价管理/举报处理；商品审核员仅见仪表盘/商品审核；超级管理员见全部 21 项）；`proxy.ts` 新增 `/admin/:path*` 匹配
- **仪表盘**（`/admin`）：数据卡片按 `can()` 权限动态展示（待审核商家申请/待审核商品/待处理举报/平台用户总数/认证商家总数/订单总数），无匹配权限时展示引导文案而非空白
- **用户与商家审核管理**：`/admin/users`（全平台账号列表，角色与状态徽章）、`/admin/merchants`（商家列表 + 店铺状态）、`/admin/merchant-applications`（待处理/历史记录分组，审核决定通过 `ApplicationReviewDialog` 组件——界面交互演示，未接入真实状态写入）；`getMerchantApplicationStatusLabel/Tone` 从 `merchant-apply/page.tsx` 抽取为共享服务 `lib/services/merchant-application-view.ts`，消除跨页面重复定义
- **商品与分类品牌管理**：`/admin/products`（全平台商品列表，未发布商品不提供公开详情页链接）、`/admin/product-reviews`（待审核 + 需修改商品，含受限制商品标记，复用 `ApplicationReviewDialog`）、`/admin/categories`、`/admin/brands`
- **交易类后台管理**：`/admin/orders`、`/admin/inquiries`（`getInquiryStatusLabel/Tone` 从 `account/inquiries/page.tsx` 抽取为共享服务 `lib/services/inquiry-view.ts`；商家侧 `merchant/inquiries` 因措辞语气不同保持独立，未强行合并）、`/admin/custom-purchases`、`/admin/group-buys`，均为全平台只读视图
- **举报处理与内容管理**：`/admin/reports`（待处理/已处理分组，审核决定复用 `ApplicationReviewDialog`）、`/admin/editorial`、`/admin/cities`、`/admin/content`、`/admin/legal`
- **系统设置、角色权限与审计日志**：`/admin/exchange-rates`（汇率列表 + 换算免责声明）、`/admin/settings`（功能开关只读展示，直接读取 `getFeatureFlags()` 确认三项开关均为关闭状态 + 系统设置键值列表）、`/admin/roles`（**页面级二次校验 `isSuperAdmin()`，非超级管理员直接访问返回「无权访问」而非泄露权限矩阵**；展示完整 `ROLE_PERMISSIONS` 矩阵与 `SUPER_ADMIN_ONLY` 独占权限）、`/admin/audit-logs`（最近审计记录，操作人角色徽章）
- **真实缺陷修复**：`/admin/roles` 渲染 `admin` 角色权限列表时发现 React key 重复警告——根因是权限矩阵由多个子集数组拼接而成（`MERCHANT_OPERATIONS` ∪ `CONTENT_MANAGEMENT` ∪ `CUSTOMER_SERVICE_OPS` ∪ `PRODUCT_REVIEW_OPS` ∪ `MERCHANT_REVIEW_OPS` ∪ `ADMIN_MANAGEMENT` 存在交集，如 `product:view`、`inquiry:view`、`order:view` 等），修复为渲染前 `[...new Set(...)]` 去重，浏览器验证去重后 83 个权限标签、0 个重复
- **浏览器实测**：客服/超级管理员/商品审核员三种角色分别登录验证导航过滤、仪表盘数据卡片范围、`/admin/roles` 越权访问拦截（客服与商品审核员均返回「无权访问」）均符合权限矩阵设计；举报处理审核弹层完整走通打开→选择决定→提交→确认文案流程；系统设置页确认三项支付/微信/SSO 功能开关均显示「已关闭」

### 主要文件

- `src/data/mock/{audit-logs,system-settings}.ts`
- `src/lib/repositories/{audit-log-repository,system-setting-repository}.ts`
- `src/lib/services/{merchant-application-view,inquiry-view}.ts`
- `src/components/admin/{AdminNav,ApplicationReviewDialog}.tsx`
- `src/app/admin/layout.tsx`
- `src/app/admin/{page,users,merchants,merchant-applications,products,product-reviews,categories,brands,orders,inquiries,custom-purchases,group-buys,reports,editorial,cities,content,legal,exchange-rates,settings,roles,audit-logs}/page.tsx`（21 个路由）
- `src/proxy.ts`（新增 `/admin/:path*` 匹配）
- `src/app/merchant-apply/page.tsx`、`src/app/account/inquiries/page.tsx`（重构为复用新抽取的共享服务）
- `tests/unit/mock-data-integrity.test.ts`（新增审计日志与系统设置校验）

### 测试结果

- `npm run lint`：通过，无警告或错误
- `npm run typecheck`：通过
- `npm run test`（Vitest）：7 个测试文件、46 个用例全部通过
- `npm run build`：通过（Next.js 16.2.10 + Turbopack；21 个 `/admin/**` 路由全部按需动态渲染）
- 浏览器实测：见上「已完成功能」末尾

### 已知问题

- 全部审核类操作（商家申请审核、商品审核、举报处理）与设置类页面均为界面交互演示，尚未接入真实数据库写入，与此前各阶段建立的模式一致，将在真实 Supabase 项目接入后统一补齐
- `/admin` 与 `/merchant` 后台布局均未提供独立退出登录入口，需返回 `/account` 页面操作，与商家后台已有约定保持一致
- 权限矩阵（`ROLE_PERMISSIONS`）内部存在跨子集的合法权限交集（预期行为，`can()` 判断不受影响），仅在 `/admin/roles` 展示页需要去重后再渲染
- 受限制商品（雪茄）的完整合规与年龄确认持久化逻辑尚未实现，属 Stage 08 范围

### 备份记录

见文首「备份记录汇总」。

### 下一阶段

Stage 08：合规、限制商品和安全 —— 受限制商品年龄确认持久化、地区限制、风险关键词自动预警、举报处理与账号封禁的完整闭环、RLS 策略草案、安全审查。

---

## Stage 08：合规、限制商品和安全

**目标**：补齐受限制商品的年龄确认与地区限制机制、风险关键词自动预警、RLS 策略草案与合规文档，并对全仓库做一次安全审查（发现并修复一处真实的开放重定向漏洞）。

### 已完成功能

- **年龄确认本地持久化**：`AgeConfirmationGate` 由纯 UI 状态升级为 `localStorage` 持久化（键名 `expectaly:age-confirmed:{contextType}:{contextId}`，对应 `age_confirmations` 表的 `context_type`/`context_id` 字段），刷新页面后确认状态保留；接入位置：`src/app/products/[slug]/page.tsx`
- **地区限制自我声明**：新增收货地区自我声明选择器（`DECLARED_REGION_OPTIONS`，本地存储键 `expectaly:declared-region`），与 `product.compliance.restrictedRegions` 比对，命中时展示「暂不支持配送至该地区」并阻断购买/联系入口；与 `account/addresses` 的真实收货地址簿是两套独立数据，避免混淆合规自我声明与订单实际地址
- **受限制商品生命周期修正（真实缺陷修复）**：`tests/unit/mock-data-integrity.test.ts` 原有断言「`age_restricted` 商品永远不能是 `published` 状态」逻辑有误——会导致受限制商品审核通过后永远无法上架。已修正为「`published` 时 `compliance_status` 必须为 `approved`，否则不得为 `published`」，并新增一个已审核通过、正式上架的雪茄类商品（托斯卡纳雪茄品鉴套装）用于公开页面的年龄确认/地区限制拦截演示，与原有 `pending_review` 状态的帕尔马雪茄套装（用于 `/admin/product-reviews` 审核队列演示）共同覆盖完整生命周期
- **风险关键词自动预警**：新增 `src/lib/services/compliance-service.ts`（`parseRiskKeywords` / `findRiskKeywordMatches` / `containsRiskKeyword`，6 个单元测试），关键词取自 `system_settings.risk_keywords`；接入 `/admin/reports`（举报描述命中时高亮）与 `/admin/product-reviews`（商品简介/故事命中时高亮），新增一条命中「高仿」关键词的举报演示数据验证效果
- **RLS 策略草案**：新增 `supabase/migrations/0010_row_level_security.sql`，覆盖全部 45 张表，包含角色判断辅助函数（`app_current_profile_id` / `app_has_role` / `app_is_staff` / `app_is_super_admin` / `app_manages_merchant`）与逐表 `select`/`insert`/`update` 策略，语义与 `src/lib/permissions/matrix.ts` 保持一致；`docs/DATABASE_SCHEMA.md` 同步更新
- **COMPLIANCE.md 合规文档**：从 Stage 00 占位改写为完整实现文档，涵盖受限制商品字段设计、年龄确认/地区限制机制、风险关键词预警、举报处理闭环、RLS 要点、11 篇法律文本状态、后续工作清单
- **全仓库安全审查**：
  - **发现并修复一处真实的开放重定向漏洞**：`src/app/auth/login/page.tsx` 中已登录用户的重定向分支仅检查 `redirectTo.startsWith("/")`，未拦截协议相对 URL（如 `//evil.com`，浏览器会解析为跨站地址），与 `lib/auth/actions.ts` 中更严格的 `safeRedirectPath()` 校验不一致。已将 `safeRedirectPath()` 提取至 `lib/auth/types.ts` 作为唯一共享实现，登录页与 Server Actions 统一复用，浏览器实测确认 `/auth/login?redirect=//evil.com` 现在正确重定向到 `/account`
  - 会话 Cookie 补充 `secure: process.env.NODE_ENV === "production"` 标志（此前遗漏）
  - `next.config.ts` 新增基础安全响应头（`X-Content-Type-Options: nosniff`、`X-Frame-Options: DENY`、`Referrer-Policy: strict-origin-when-cross-origin`），浏览器实测确认响应头生效
  - 复查 `JsonLd` 组件的 `dangerouslySetInnerHTML` 用法：已正确转义 `<` 防止 `</script>` 注入，无需改动
  - 复查用户可控文本字段（如 `referenceUrl`）：未在任何页面被渲染为可点击链接，无 XSS/跳转风险
- **浏览器实测**：受限制商品年龄确认门（未确认时正确阻断）→ 地区选择器（选择受限地区「西藏自治区」正确阻断并显示「暂不支持配送至该地区」，改选「上海市」后正确显示询价/购物车入口）→ 刷新页面确认年龄与地区声明均持久化；开放重定向修复确认（`redirect=//evil.com` 正确落地 `/account`）；安全响应头通过 `fetch()` 校验；`/admin/reports` 与 `/admin/product-reviews` 风险关键词高亮确认生效；`/admin/product-reviews` 队列确认仅显示 `pending_review` 商品，已上架的受限制商品不再出现在审核队列中；控制台全程无报错

### 主要文件

- `src/components/shared/AgeConfirmationGate.tsx`（重写：本地持久化 + 地区限制自我声明）
- `src/app/products/[slug]/page.tsx`（传入 `contextType`/`contextId`/`restrictedRegions`）
- `src/lib/services/compliance-service.ts`、`tests/unit/compliance-service.test.ts`
- `src/app/admin/reports/page.tsx`、`src/app/admin/product-reviews/page.tsx`（接入风险关键词高亮）
- `src/data/mock/products.ts`（新增已审核通过的受限制商品）、`src/data/mock/reports.ts`（新增命中风险关键词的举报演示数据）
- `tests/unit/mock-data-integrity.test.ts`（修正受限制商品生命周期断言）
- `supabase/migrations/0010_row_level_security.sql`
- `docs/COMPLIANCE.md`（完整重写）、`docs/DATABASE_SCHEMA.md`（更新 RLS 相关说明）
- `src/lib/auth/types.ts`（新增共享 `safeRedirectPath()`）、`src/lib/auth/actions.ts`（改为复用共享实现）、`src/app/auth/login/page.tsx`（修复开放重定向）
- `src/lib/auth/session.ts`（Cookie 补充 `secure` 标志）、`next.config.ts`（新增安全响应头）

### 测试结果

- `npm run lint`：通过，无警告或错误
- `npm run typecheck`：通过
- `npm run test`（Vitest）：8 个测试文件、52 个用例全部通过
- `npm run build`：通过（Next.js 16.2.10 + Turbopack）
- 浏览器实测：见上「已完成功能」末尾

### 已知问题

- `restrictedRegions` 与地区自我声明清单为示例数据，不代表平台已确认的真实法规清单，正式上线前需法务与合规团队重新核定
- 账号封禁、内容下架等举报处理后果仍为界面交互演示，未接入真实数据写入，与项目全程「repositories 第一期只读」的原则一致
- RLS 策略为草案，尚未在真实 Supabase 项目上执行验证
- 未添加严格的 Content-Security-Policy（CSP）：Next.js 应用的内联 hydration 脚本需要额外的 nonce/hash 配置才能安全启用严格 CSP，评估后判断应在真实生产环境部署时结合具体基础设施一并配置，避免在本阶段引入未经测试的破坏性变更

### 备份记录

见文首「备份记录汇总」。

### 下一阶段

Stage 09：完整测试与优化 —— 补充端到端测试（Playwright）、可访问性审查、性能优化（图片/字体/代码分割）、SEO 复查、跨浏览器兼容性验证。

---

## Stage 09：完整测试与优化

**目标**：搭建 Playwright 端到端测试基础设施并覆盖核心用户旅程、商家/平台后台权限边界与 Stage08 合规流程；引入 axe-core 自动化可访问性扫描；完成性能与 SEO 复查。本阶段是全流程自动化验证首次引入真实浏览器执行，过程中发现并修复多个此前未被察觉的真实缺陷。

### 已完成功能

- **Playwright 基础设施**：安装 `@playwright/test`，配置 `playwright.config.ts`（独立开发服务器端口 3101，避免与手动预览冲突；三个项目 `chromium`/`firefox`/`mobile-chrome`，第一期不安装 WebKit 以控制体积/时间）；`package.json` 新增 `test:e2e`/`test:e2e:ui` 脚本；`.gitignore` 补充 `playwright-report`/`test-results` 等产物目录
- **核心用户旅程 E2E**（`tests/e2e/{homepage,auth-login,navigation-drawer,discover-search,product-detail,cart-wishlist-inquiry}.spec.ts`）：首页、登录与路由保护（含开放重定向防护回归测试）、移动端导航抽屉、商品发现筛选/搜索、商品详情页（含 404 边界）、购物车/收藏/询价
- **商家与平台后台 E2E**（`tests/e2e/{merchant-portal,admin-portal}.spec.ts`）：认证商家概览、非商家引导页、跨商家编辑商品 404 拦截；平台后台按角色的导航过滤（客服 vs 超级管理员）、非超级管理员访问 `/admin/roles` 拦截、商品审核弹层交互
- **合规流程 E2E**（`tests/e2e/compliance-gate.spec.ts`）：年龄确认门 → 地区声明 → 受限地区拦截 → 切换地区恢复交易入口 → 刷新持久化的完整链路，以及举报页风险关键词高亮
- **自动化可访问性扫描**（`@axe-core/playwright`，`tests/e2e/accessibility.spec.ts`）：覆盖首页、发现页、商品详情页、登录页、用户中心、购物车、商家后台、平台后台、法律文本页共 9 个代表性模板；额外对全站 19 个页面模板做过一次性全量扫描（含 moderate 级别）辅助定位系统性问题
- **SEO 复查**（`tests/e2e/seo.spec.ts`）：验证 `sitemap.xml`/`robots.txt` 有效性、商品详情页 `Product` JSON-LD 结构化数据、页面标题/描述、canonical 链接
- **性能复查**：确认全站仅 1 个页面（`/internal/ui-kit`）为 `"use client"`，其余路由均为 Server Component，客户端交互已下沉到叶子组件；确认字体通过 `next/font/google` 自托管 + `swap`；确认依赖集精简无重量级第三方库；图片优化因当前全站为占位图暂不适用，留待接入真实图片资源后实施

### 真实缺陷发现与修复（本阶段核心价值）

1. **Drawer 组件关闭态仍拦截页面点击**（影响移动端菜单与筛选抽屉）：`<dialog>` 元素关闭时浏览器 UA 样式默认 `display:none`，但 Drawer 组件无条件应用 Tailwind `flex flex-col`，其作者样式覆盖了该默认值，导致关闭状态下抽屉仍以透明状态占据左上角 320×720px 区域并拦截该区域内其他元素的点击——这正是本会话此前多次遇到"点击无响应、需改用 JS `requestSubmit()` 绕过"的根本原因，直到本阶段引入真实 Playwright 浏览器自动化点击才被诊断出来。已修复为按 `open` 状态切换 `flex flex-col` / `hidden`。
2. **`--color-ink-faint` 颜色对比度不达标（WCAG AA）**：原值 `#9aa3af` 对 `paper`/白底/`surface-muted` 三种背景对比度仅 1.9~2.6:1（标准要求 4.5:1），影响全站页脚版权文字、法律文本版本说明等大量位置。经计算验证后调整为 `#65707d`（对三种背景均 ≥4.5:1，同时与 `ink-muted` 保持可辨识层级）。
3. **标题层级跳跃（`heading-order`）**：`ProductCard`/`BrandCard`/`MerchantCard`、城市与专题列表页内联卡片、`Footer` 栏目标题、`AgeConfirmationGate` 提示标题均使用 `<h3>` 直接跟随页面 `<h1>`，跳过 `<h2>`。统一调整为 `<h2>`，全站 19 个页面模板复扫确认 0 违规。
4. **商品详情页占位标签对比度二次跌破**：视频/360° 占位标签在已修复的 `ink-faint` 基础上叠加 `opacity-50`，导致有效对比度再次降至 1.94:1。移除多余的 `opacity-50`（文案本身已通过"暂未开放"说明清楚传达状态，无需额外靠透明度弱化）。
5. **公开页面普遍缺失 canonical 链接**：全站无任何页面设置 `<link rel="canonical">`。为全部 19 个可索引公开页面（含 `products`/`brands`/`merchants`/`cities`/`editorial`/`legal` 等动态详情页）补充 `alternates.canonical`。

### 主要文件

- `playwright.config.ts`、`package.json`（新增 `test:e2e`/`test:e2e:ui` 脚本与 `@playwright/test`/`@axe-core/playwright` 依赖）
- `tests/e2e/*.spec.ts`（11 个测试文件）、`tests/e2e/utils/auth.ts`（演示账号登录/登出测试辅助函数）
- `src/components/ui/Drawer.tsx`（关闭态 `display` 修复）
- `src/app/globals.css`（`--color-ink-faint` 对比度修复）
- `src/components/product/ProductCard.tsx`、`src/components/brand/BrandCard.tsx`、`src/components/merchant/MerchantCard.tsx`、`src/app/cities/page.tsx`、`src/app/editorial/page.tsx`、`src/components/layout/Footer.tsx`、`src/components/shared/AgeConfirmationGate.tsx`（标题层级修复）
- `src/app/products/[slug]/page.tsx`（移除多余 `opacity-50`；新增 canonical）
- 新增 canonical：`src/app/page.tsx`、`src/app/{discover,brands,merchants,cities,editorial,search,custom-purchase,faq,about,how-it-works,merchant-apply}/page.tsx`、`src/app/{products,brands,merchants,cities,editorial,legal}/[slug]/page.tsx`
- `docs/TEST_CHECKLIST.md`（完整重写，记录 Playwright 测试清单与本阶段发现的真实缺陷）

### 测试结果

- `npm run lint`：通过，无警告或错误
- `npm run typecheck`：通过
- `npm run test`（Vitest）：8 个测试文件、52 个用例全部通过
- `npm run build`：通过（Next.js 16.2.10 + Turbopack）
- `npm run test:e2e`（Playwright，chromium + firefox + mobile-chrome 三项目）：11 个测试文件、45 个用例 × 3 项目 = 135 个测试全部通过
- 浏览器实测：见上「真实缺陷发现与修复」

### 已知问题

- WebKit（Safari 引擎）未安装，暂无 Mobile Safari / Safari 桌面端的自动化覆盖，后续如需覆盖 Safari 特有渲染问题需补充安装
- 图片仍为占位渐变块，`next/image` 响应式优化与真实图片性能测试留待接入 Supabase Storage 后进行
- 未配置严格 Content-Security-Policy（沿用 Stage08 的评估结论，留待生产部署时结合具体基础设施配置）
- axe-core 扫描仅覆盖 serious/critical 级别的强制断言，moderate/minor 级别问题在开发过程中一并修复但未纳入自动化阻断条件，避免因非阻塞性问题误报导致测试脆弱

### 备份记录

见文首「备份记录汇总」。

### 下一阶段

Stage 10：发布准备 —— 生产环境部署文档、环境变量清单核对、Supabase 项目正式接入准备、种子数据导入脚本、发布检查清单、版本号与变更日志。

---

## Stage 10：发布准备

**目标**：完成生产部署指导文档、环境变量分级核对、种子数据导入方案与生成脚本、发布前人工检查清单、版本号与变更日志，为项目从「第一期演示数据开发」过渡到「接入真实 Supabase 项目」做好文档与工具准备。**本阶段不执行任何真实部署、DNS 变更或 Supabase 项目创建。**

### 已完成功能

- **`docs/DEPLOYMENT.md` 完整重写**：托管平台建议（Vercel 优先）、`shop.expectaly.com` 域名/DNS 配置说明（明确标注需由主站域名管理权限方手动执行）、环境变量四级分级清单（必需 / 接入 Supabase 后必需 / 功能开关 / 预留）、构建发布流程、发布后人工冒烟测试清单、接入真实 Supabase 的 7 步后续工程说明、发布前已知限制汇总
- **种子数据导入方案**（`docs/SEED_DATA_IMPORT.md` + `scripts/generate-seed-sql.ts`）：新增确定性 UUID v5 生成器（基于 `node:crypto`，同一 mock 字符串 ID 每次生成结果一致，可跨表复用维持外键一致性），覆盖「浏览目录」核心链路的完整外键闭环（`profiles` → `user_roles` → `merchant_applications` → `merchants` → `brands`/`categories`/`product_tags` → `products` → `product_tag_relations`），生成结果写入 `supabase/seed/generated-seed.sql`；文档中说明其余约 35 张表的扩展方式与已知限制
- **`docs/RELEASE_CHECKLIST.md` 新增**：覆盖代码质量、环境变量、认证权限、数据库与 RLS、合规法务、域名基础设施、SEO、监控备份、冒烟测试、回滚预案共 10 个类别的人工核对清单
- **`CHANGELOG.md` 新增**：按 Keep a Changelog 格式汇总 Stage 00-10 每个版本的 Added/Fixed 条目；`package.json` 版本号由 `0.1.0` 调整为 `0.10.0`，对应 Stage 10 完成、仍基于演示数据的第一期开发状态（非生产就绪的 `1.0.0`）

### 主要文件

- `docs/DEPLOYMENT.md`（完整重写）、`docs/SEED_DATA_IMPORT.md`（新增）、`docs/RELEASE_CHECKLIST.md`（新增）、`CHANGELOG.md`（新增）
- `scripts/generate-seed-sql.ts`、`supabase/seed/generated-seed.sql`
- `package.json`（新增 `db:seed:sql` 脚本、`tsx` 开发依赖、版本号更新）

### 测试结果

- `npm run lint`：通过，无警告或错误
- `npm run typecheck`：通过
- `npm run test`（Vitest）：8 个测试文件、52 个用例全部通过
- `npm run test:e2e`（Playwright，三项目）：11 个测试文件、135 个测试全部通过
- `npm run build`：通过（Next.js 16.2.10 + Turbopack）
- `npm run db:seed:sql`：成功生成 `supabase/seed/generated-seed.sql`，映射 95 个确定性 UUID，人工核对内容与预期一致（正确的 JSONB/text[] 序列化、外键跨表对齐）

### 已知问题

- `npm audit`：1 个 moderate + 2 个 high 级别漏洞，均来自 `next` 的传递依赖（`postcss`/`sharp`），修复需降级 `next` 到不兼容 App Router 的版本，延续 Stage 01 起的判断，留待后续 Next.js 版本升级时一并处理
- 种子数据生成器仅覆盖核心目录浏览链路（约 8 张表），其余约 35 张表需按文档说明的模式自行扩展
- 本阶段全部为文档与工具准备工作，真实的 Supabase 项目创建、DNS 配置、生产部署均未执行，需由具备相应权限的人员在后续独立完成

### 备份记录

见文首「备份记录汇总」。

### 下一阶段

无——Stage 00 至 Stage 10 全部 11 个阶段已按原始规划完成。后续工作转入 `docs/DEPLOYMENT.md` 第 8 节所述的真实 Supabase 接入与生产部署工程，不再属于本次自动化开发流程范围。
