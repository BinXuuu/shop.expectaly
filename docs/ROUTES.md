# 路由规划文档（ROUTES）

> 状态：Stage 10 已完成，全部 11 个阶段（Stage 00-10）按规划实现。以下路由清单为最终状态，下方用 ✅ 标注已实现路由。Stage 09-10 未新增路由，仅做测试/优化/发布准备工作。

## 用户端

```
/                          ✅ 首页
/discover                  ✅ 商品发现（含筛选/排序/网格/列表/移动端抽屉）
/search                    ✅ 搜索（商品/品牌/商家/城市/专题，含搜索历史与热门搜索）
/products/[slug]           ✅ 商品详情
/categories/[slug]         ✅ 分类页（重定向至 /discover?category=slug）
/brands                    ✅ 品牌列表
/brands/[slug]             ✅ 品牌详情
/merchants                 ✅ 商家列表
/merchants/[slug]          ✅ 商家详情
/cities                    ✅ 城市选品列表
/cities/[slug]             ✅ 城市详情
/editorial                 ✅ 专题策展列表
/editorial/[slug]          ✅ 专题详情
/custom-purchase           ✅ 自定义代购需求表单（界面演示，未接入后端持久化）
/about                     ✅ 平台介绍
/how-it-works              ✅ 代购流程说明
/merchant-apply            ✅ 商家入驻介绍 + 在线申请表单 + 审核状态展示（界面演示，未接入持久化）
/faq                       ✅ 常见问题（手风琴交互）
/legal/[slug]              ✅ 法律文本（11 篇，均标注待法律顾问审核）
/sitemap.xml                ✅ 动态站点地图（静态路由 + 商品/品牌/商家/城市/专题/法律 slug）
/robots.txt                 ✅ 爬虫规则（禁止 /internal /account /merchant /admin /cart /api）
/auth/login                ✅ 登录（邮箱/手机号模拟登录 + 演示账号快捷登录 + 微信登录占位）
/auth/register             ✅ 注册（开发环境临时账号，不落库）
/auth/callback              ✅ OAuth 回调骨架（Route Handler，按 provider 分支，未配置时友好跳转）
/cart                      ✅ 购物车（按商家分组、批量询价、数量/删除为界面演示，受 proxy.ts 保护）
/account                   ✅ 用户中心概览（受 proxy.ts 路由保护）
/account/orders            ✅ 我的订单（订单 + 我参与的拼单 + 我的预订）
/account/orders/[id]        ✅ 订单详情（状态审计轨迹 + 代购进度时间线，服务端校验订单归属）
/account/inquiries         ✅ 询价记录
/account/custom-purchases  ✅ 代购申请
/account/wishlist          ✅ 我的收藏
/account/history           ✅ 浏览历史（本地 localStorage 记录，无对应数据库实体）
/account/notifications     ✅ 消息通知
/account/addresses         ✅ 地址管理（新增地址为界面演示，未接入持久化）
/account/reviews           ✅ 我的评价（商品评价 + 商家评价）
/account/settings          ✅ 账号设置（资料/语言/隐私偏好，界面演示）
```

内部专用（非公开路由，`robots.txt` 已禁止索引）：

```
/internal/ui-kit           ✅ Stage 02 设计系统内部验收页
```

## 商家后台

均受 `proxy.ts` 路由保护 + `merchant/layout.tsx` 二次校验（需登录且账号已关联通过审核的商家，否则展示「你还不是认证商家」引导页而非报错）：

```
/merchant                   ✅ 数据概览（商品/询价/订单/拼单统计卡片）
/merchant/products          ✅ 商品列表（状态徽章 + 编辑入口）
/merchant/products/new      ✅ 新建商品（界面演示，提交后提示进入待审核）
/merchant/products/[id]/edit ✅ 编辑商品（服务端校验商品归属，非本商家商品返回 404）
/merchant/inquiries         ✅ 询价管理（回复报价弹层，界面演示）
/merchant/orders            ✅ 订单管理（平台订单/自主交易）
/merchant/group-buys        ✅ 拼单管理
/merchant/preorders         ✅ 预订管理
/merchant/store             ✅ 店铺资料（编辑表单，界面演示）
/merchant/verification      ✅ 认证资料（认证等级展示 + 补充材料上传占位）
/merchant/content           ✅ 内容管理（采购现场发布，界面演示）
/merchant/reviews           ✅ 评价管理（商品评价 + 店铺评价）
/merchant/analytics         ✅ 数据统计（浏览量/收藏量/订单/评分 + 商品浏览排行）
/merchant/settings          ✅ 账号安全（团队成员列表）
```

## 平台后台

均受 `proxy.ts` 路由保护 + `admin/layout.tsx` 二次校验（需登录且账号至少拥有一个平台后台角色，否则展示「无权访问平台后台」引导页）。侧边导航 `AdminNav` 按角色权限动态过滤，未授权角色不会看到无关导航项：

```
/admin                       ✅ 仪表盘（数据卡片按角色权限动态展示）
/admin/users                 ✅ 用户管理（customer_service / admin / super_admin）
/admin/merchants             ✅ 商家管理（merchant_reviewer / admin / super_admin）
/admin/merchant-applications ✅ 商家审核（通过/驳回/需补充资料，界面演示）
/admin/products              ✅ 商品管理（全平台商品列表）
/admin/product-reviews       ✅ 商品审核（含受限制商品标记，审核决定为界面演示）
/admin/categories            ✅ 分类管理
/admin/brands                ✅ 品牌管理
/admin/orders                ✅ 订单管理（全平台只读视图）
/admin/inquiries             ✅ 询价管理（全平台只读视图）
/admin/custom-purchases      ✅ 代购需求（全平台只读视图）
/admin/group-buys            ✅ 拼单管理（全平台只读视图）
/admin/reports               ✅ 举报处理（驳回/警告/下架，界面演示）
/admin/editorial             ✅ 专题管理
/admin/cities                ✅ 城市管理
/admin/content               ✅ 内容管理
/admin/legal                 ✅ 法律文本管理
/admin/exchange-rates        ✅ 汇率设置
/admin/settings              ✅ 系统设置（功能开关只读展示 + 配置项列表）
/admin/roles                 ✅ 角色权限（仅 super_admin，权限矩阵只读展示）
/admin/audit-logs            ✅ 审计日志（admin / super_admin）
```
