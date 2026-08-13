# 意料之中～意购（Expectaly Shop）

意大利小众品牌集合店 / 意大利本地买手平台 / 意大利代购资源整合平台 —— 「意料之中」品牌旗下商城子站，域名规划为 `shop.expectaly.com`。

> 本仓库只负责商城站点开发，与主站 `expectaly.com` 相互独立，但预留账号互通接口（见 [docs/MAIN_SITE_INTEGRATION.md](./docs/MAIN_SITE_INTEGRATION.md)）。

## 技术栈

Next.js (App Router) · TypeScript（严格模式）· Tailwind CSS · Supabase（规划中）· Zod · React Hook Form · Lucide Icons · Vitest · Playwright · npm

## 开发

```bash
npm install
npm run dev
```

打开 http://localhost:3000

## 常用脚本

| 命令                   | 说明                          |
| ---------------------- | ----------------------------- |
| `npm run dev`          | 启动开发服务器                |
| `npm run build`        | 生产构建                      |
| `npm run start`        | 启动生产服务器                |
| `npm run lint`         | ESLint 检查                   |
| `npm run typecheck`    | TypeScript 类型检查（无输出） |
| `npm run format`       | Prettier 格式化写入           |
| `npm run format:check` | Prettier 检查（不写入）       |

## 目录结构

详见 [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)。

```
src/app/          Next.js 页面与路由
src/components/   UI 与业务组件
src/lib/          数据访问、服务、权限、校验、工具、配置
src/types/        全局类型定义
src/data/mock/    演示数据（非真实品牌授权）
src/i18n/         多语言文案
supabase/         数据库迁移（规划中）
scripts/          备份与安全检查脚本
docs/             项目文档
```

## 项目文档

- [PROJECT_REQUIREMENTS.md](./docs/PROJECT_REQUIREMENTS.md) —— 完整产品需求
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) —— 架构设计
- [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) —— 数据库设计
- [ROUTES.md](./docs/ROUTES.md) —— 路由规划
- [ROLES_AND_PERMISSIONS.md](./docs/ROLES_AND_PERMISSIONS.md) —— 角色与权限
- [PAYMENT_RESERVATION.md](./docs/PAYMENT_RESERVATION.md) —— 支付预留设计
- [MAIN_SITE_INTEGRATION.md](./docs/MAIN_SITE_INTEGRATION.md) —— 主站账号互通方案
- [COMPLIANCE.md](./docs/COMPLIANCE.md) —— 合规与受限制商品
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) —— 部署说明
- [PROGRESS.md](./docs/PROGRESS.md) —— 阶段进度与备份记录
- [TEST_CHECKLIST.md](./docs/TEST_CHECKLIST.md) —— 测试清单

## 环境变量

复制 `.env.example` 为 `.env.local` 并按需填写，`.env.local` 不会被提交到版本库。第一期本地开发不依赖真实 Supabase / 微信 / 支付等外部服务即可运行（数据层回退到内置模拟数据）。

## 备份

项目按阶段备份到 `D:\网页备份\意料之中-易购\<阶段名>-<时间戳>\`，通过脚本执行：

```powershell
./scripts/backup-stage.ps1 -StageName "stage-00-initial"
```

脚本会严格校验源目录与目标根目录、排除 `node_modules`/`.next`/`dist`/`build`/`coverage` 等缓存目录、不会删除任何历史备份，并将结果追加到 `docs/PROGRESS.md`。

## 开发阶段

本项目严格按阶段式开发（Stage 00 ~ Stage 10），详见 [docs/PROGRESS.md](./docs/PROGRESS.md)。当前阶段：**Stage 00 —— 环境检查与项目初始化**。
