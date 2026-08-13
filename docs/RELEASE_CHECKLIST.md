# 发布检查清单（RELEASE_CHECKLIST）

> 状态：Stage 10 完成。本清单为**人工核实用**的发布前检查表，不代表任何一项已被执行——本项目全程仅在本地开发，未部署到任何真实环境、未创建任何真实 Supabase 项目、未修改任何真实 DNS 记录。发布决策与执行需由项目负责人自行安排。

## 1. 代码质量与自动化验证

- [ ] `npm run lint` 通过，无警告或错误
- [ ] `npm run typecheck` 通过
- [ ] `npm run test`（Vitest 单元测试，当前 8 个文件 / 52 个用例）全部通过
- [ ] `npm run test:e2e`（Playwright，chromium + firefox + mobile-chrome，当前 11 个文件 / 135 个测试）全部通过
- [ ] `npm run build` 生产构建成功，无告警
- [ ] `npm audit` 复查：当前 1 个 moderate + 2 个 high 级别漏洞均来自 `next` 的传递依赖（`postcss`/`sharp`），修复需降级 `next` 至不兼容 App Router 的旧版本，判断为不应在本阶段处理；发布前应确认是否有更新的 Next.js 补丁版本可用

## 2. 环境变量与功能开关

- [ ] 生产环境变量已按 `docs/DEPLOYMENT.md` 第 5 节逐项核对，必需变量（`NEXT_PUBLIC_SITE_URL` 等）已设置为真实生产值
- [ ] **`PAYMENT_ENABLED` 确认为 `false`**（除非已完成真实支付网关的完整接入与合规评审——第一期不具备）
- [ ] `WECHAT_LOGIN_ENABLED`、`MAIN_SITE_SSO_ENABLED` 按实际接入进度设置，未接入时保持 `false`
- [ ] `.env.local` / 生产环境变量配置未提交到任何版本库

## 3. 认证与权限

- [ ] **`src/components/auth/LoginForm.tsx` 的「开发环境快捷登录」面板与 `loginAsDemoProfile` 已移除或严格限制访问**（这是第一期开发/演示专用功能，绝不能出现在真实生产环境——见 `docs/DEPLOYMENT.md` 第 8 节）
- [ ] 手机号登录的固定验证码 `123456`（`DEV_SMS_CODE`）已替换为真实短信网关接入
- [ ] 真实 Supabase Auth 已接入，`src/lib/auth/session.ts` 已从开发环境 Cookie 方案切换为读取真实 Session
- [ ] 已创建至少一个真实的 `super_admin` 账号，并验证可正常登录 `/admin` 及 `/admin/roles`
- [ ] 已在真实环境验证跨角色越权访问拦截（如非商家账号访问商家后台、非本商家编辑他人商品、非超级管理员访问角色权限页）

## 4. 数据库与 RLS

- [ ] Supabase 项目已创建，`supabase/migrations/0001` ~ `0010` 已按顺序执行
- [ ] `0010_row_level_security.sql`（RLS 策略草案）已在**非生产项目**充分测试后再应用到生产项目——该文件明确标注为草案，尚未经真实项目验证
- [ ] `src/lib/repositories/*.ts` 已从 `src/data/mock/` 内存实现切换为读取真实 Supabase
- [ ] 若使用 `scripts/generate-seed-sql.ts` 生成过测试数据，确认**未**将虚构的品牌/商家/商品数据导入生产项目（见 `docs/SEED_DATA_IMPORT.md`）

## 5. 合规与法务

- [ ] 全部 11 篇法律文本（用户协议、隐私政策、Cookie 政策等）已由法务团队审阅，移除「待法律顾问审核」横幅
- [ ] 受限制商品（如雪茄类）的 `restrictedRegions` 示例清单已由合规团队基于真实政策重新核定（见 `docs/COMPLIANCE.md` 2.3 节）
- [ ] 年龄确认机制的持久化方案已评估是否需要从本地 `localStorage` 升级为服务端记录（`age_confirmations` 表）
- [ ] 风险关键词清单（`system_settings.risk_keywords`）已按实际运营需求扩充

## 6. 域名与基础设施

- [ ] `shop.expectaly.com` 的 DNS 记录已由拥有主站域名管理权限的人员配置完成
- [ ] HTTPS 证书签发成功
- [ ] 反向代理/CDN（如自托管）的安全响应头配置与 `next.config.ts` 中的 `X-Content-Type-Options`/`X-Frame-Options`/`Referrer-Policy` 不冲突
- [ ] 若接入跨子域账号互通，`MAIN_SITE_SHARED_COOKIE_DOMAIN` 与主站团队已协调一致

## 7. SEO 与内容

- [ ] `sitemap.xml`、`robots.txt` 在生产域名下可正常访问且内容正确
- [ ] 关键页面（首页、商品详情、品牌/商家详情）的 title/description/canonical/JSON-LD 已抽查确认
- [ ] 商品图片已从 `PlaceholderImage` 占位替换为真实图片资源，并接入 `next/image` 优化

## 8. 监控与备份

- [ ] 生产环境错误监控（如 Sentry）已接入
- [ ] 数据库定期备份策略已确认（Supabase 自带的 Point-in-Time Recovery 或额外备份方案）
- [ ] 关键操作（商家/商品审核、举报处理、角色变更）的审计日志（`audit_logs`）已确认为真实服务端写入，而非第一期的界面演示

## 9. 冒烟测试

- [ ] 参考 `docs/DEPLOYMENT.md` 第 7 节完成发布后人工冒烟测试
- [ ] 移动端与桌面端各抽查 1-2 个核心页面的实际渲染效果
- [ ] 确认页面中不存在任何"支付成功"相关文案或可达路径

## 10. 回滚预案

- [ ] 已确认托管平台的版本回滚机制（如 Vercel 的即时回滚到前一次部署）
- [ ] 若涉及数据库结构变更，已准备好对应的 down migration 或回滚步骤
- [ ] 发布窗口已通知相关团队，并预留监控观察期
