# 变更日志（CHANGELOG）

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

> 说明：`0.x.y` 系列版本对应第一期（Stage 00-10）全部基于演示数据（`src/data/mock/`）的功能开发，尚未连接真实 Supabase 项目、真实支付网关或完成法务审核，不构成生产就绪版本。详细的分阶段实现记录见 `docs/PROGRESS.md`；发布前完整核对清单见 `docs/RELEASE_CHECKLIST.md`。

## [0.10.0] - Stage 10：发布准备

### Added

- `docs/DEPLOYMENT.md` 完整部署指南（托管平台建议、域名/DNS 说明、环境变量分级清单、构建发布流程、Supabase 接入步骤）
- `docs/SEED_DATA_IMPORT.md` 与 `scripts/generate-seed-sql.ts`：将 mock 数据转换为可执行 SQL 的参考生成器（确定性 UUID 映射，覆盖核心目录浏览链路）
- `docs/RELEASE_CHECKLIST.md` 发布前人工核对清单
- `CHANGELOG.md`（本文件）

## [0.9.0] - Stage 09：完整测试与优化

### Added

- Playwright 端到端测试基础设施（chromium / firefox / mobile-chrome 三项目），11 个测试文件、135 个测试用例
- `@axe-core/playwright` 自动化可访问性扫描，覆盖 9 个代表性页面模板 + 全站 19 个模板复扫

### Fixed

- **Drawer 组件关闭态仍拦截页面点击**：`<dialog>` 关闭时因作者样式无条件应用 `flex` 覆盖了浏览器默认的 `display:none`，导致移动端菜单/筛选抽屉在关闭后仍拦截其区域内的点击事件
- **`--color-ink-faint` 颜色对比度不达标 WCAG AA**（原 1.9~2.6:1，调整后 ≥4.5:1），影响全站页脚、法律文本版本说明等多处
- 标题层级跳跃（`ProductCard`/`BrandCard`/`MerchantCard`/城市专题列表/`Footer`/`AgeConfirmationGate` 的 `<h3>` 直跟 `<h1>`），统一调整为 `<h2>`
- 商品详情页占位标签 `opacity-50` 叠加已修复的 `ink-faint` 导致对比度二次跌破，移除多余透明度
- 全站 19 个可索引公开页面补充 `<link rel="canonical">`

## [0.8.0] - Stage 08：合规、限制商品和安全

### Added

- 受限制商品年龄确认改为 `localStorage` 持久化；新增收货地区自我声明与 `restrictedRegions` 拦截
- 风险关键词自动预警服务（`compliance-service.ts`），接入举报处理与商品审核队列
- `supabase/migrations/0010_row_level_security.sql` RLS 策略草案（覆盖全部 45 张表）
- `docs/COMPLIANCE.md` 完整合规文档

### Fixed

- **开放重定向漏洞**：登录页对已登录用户的重定向分支未拦截协议相对 URL（如 `//evil.com`），已提取共享的 `safeRedirectPath()` 统一复用
- 会话 Cookie 补充 `secure` 标志；新增基础安全响应头
- 受限制商品生命周期断言修正：原逻辑导致审核通过的受限制商品永远无法上架

## [0.7.0] - Stage 07：平台管理后台

### Added

- 全部 21 个 `/admin/**` 路由：仪表盘、用户/商家管理与审核、商品管理与审核、分类/品牌管理、订单/询价/代购需求/拼单管理、举报处理、内容管理、法律文本、汇率与系统设置、角色权限矩阵（仅超级管理员）、审计日志
- 按角色权限动态过滤的后台导航（`AdminNav`）

## [0.6.0] - Stage 06：购物车、询价、订单和支付预留

### Added

- 购物车页面 `/cart`（按商家分组结算）
- 订单详情页与代购进度时间线可视化组件
- 账户订单页扩展：我参与的拼单、我的预订
- 全仓库支付预留一致性审查（确认无可达的虚假支付成功路径）

## [0.5.0] - Stage 05：商家入驻与商家后台

### Added

- 商家入驻在线申请流程（三态分支：登录引导 / 申请状态展示 / 在线表单）
- 商家后台全部 14 个路由：数据概览、商品管理、询价/订单/拼单/预订管理、店铺资料、认证、内容、评价、统计、账号安全
- 跨商家数据隔离（服务端校验商品归属，越权访问返回 404）

## [0.4.0] - Stage 04：登录、用户中心与主站接口预留

### Added

- 开发环境模拟登录体系（邮箱/手机号/演示账号/微信占位）
- Next.js 16 `proxy.ts` 路由保护
- 用户中心全部 10 个子页面
- `docs/MAIN_SITE_INTEGRATION.md` 主站账号互通目标架构文档

## [0.3.0] - Stage 03：公开用户页面

### Added

- 首页、商品发现页（筛选/排序/网格/列表）、商品详情页、品牌/商家/城市/专题列表与详情、搜索页、自定义代购页
- 平台说明、代购流程、商家入驻介绍、FAQ、11 篇法律文本页面
- SEO 元数据、JSON-LD 结构化数据、sitemap.xml、robots.txt

## [0.2.0] - Stage 02：设计系统

### Added

- 设计 Token（色彩/字体/圆角/阴影/断点，参考 expectaly.com 主站视觉）
- 基础 UI 组件库（Button/Input/Textarea/Select/Badge/Dialog/Drawer）
- Header/Footer/移动端菜单、商品/品牌/商家业务卡片
- `/internal/ui-kit` 内部组件验收页

## [0.1.0] - Stage 01：架构、类型与模拟数据层

### Added

- 完整 TypeScript 类型定义（~45 个实体）
- 11 角色权限矩阵与守卫函数
- 统一错误格式与功能开关（支付/微信登录/主站互通默认全部关闭）
- Repository/Service 数据访问层（`ReadRepository<T>` 通用接口）
- 全套演示数据（品牌/商家/商品/订单/询价等）
- Supabase 迁移 SQL 草案（`0001`-`0009`）
- Vitest 单元测试基础设施

## [0.0.1] - Stage 00：环境检查与项目初始化

### Added

- Next.js 16 + TypeScript + Tailwind CSS v4 项目骨架
- ESLint / Prettier 工具链
- 安全检查脚本与备份脚本（`scripts/safety-check.ps1` / `scripts/backup-stage.ps1`）
- 11 份文档骨架
