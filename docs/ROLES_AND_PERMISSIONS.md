# 角色与权限文档（ROLES_AND_PERMISSIONS）

> 状态：Stage 01 已实现类型层与权限矩阵代码（`src/types/roles.ts`、`src/lib/permissions/`）。
> 实际登录态接入将在 Stage 04（用户认证）、Stage 05（商家后台）、Stage 07（平台后台）逐步完成路由保护。

## 角色列表

1. 游客（Guest）—— 未登录访问者，仅可浏览公开内容
2. 普通用户（User）—— 已注册账号，可下单、询价、收藏、提交代购需求
3. 入驻申请中的用户（MerchantApplicant）—— 已提交商家入驻申请、等待审核
4. 已认证商家（Merchant）—— 审核通过，可发布商品、管理店铺
5. 平台自营运营人员（PlatformOperator）—— 管理平台自营商品与内容
6. 内容编辑（ContentEditor）—— 管理首页内容、专题策展、城市指南、FAQ
7. 客服（CustomerService）—— 处理询价、订单查询、举报初筛
8. 商品审核员（ProductReviewer）—— 审核商品发布/下架
9. 商家审核员（MerchantReviewer）—— 审核商家入驻申请与认证
10. 管理员（Admin）—— 覆盖平台绝大部分管理操作
11. 超级管理员（SuperAdmin）—— 额外拥有角色管理、系统关键设置权限，且对所有权限放行

一个账号（`Profile`）可以同时拥有多个角色（如「商家 + 普通用户」），由 `user_roles` 表（`UserRoleAssignment` 类型）记录。

## 权限模型实现

- 权限资源（`PermissionResource`）× 操作（`PermissionAction`）组合成权限键，如 `product:create`、`merchant_application:approve`，定义于 [`src/lib/permissions/matrix.ts`](../src/lib/permissions/matrix.ts)。
- `ROLE_PERMISSIONS` 定义每个角色（除 `super_admin`）拥有的权限键集合；`super_admin` 对所有权限放行，并额外拥有 `SUPER_ADMIN_ONLY`（角色管理、系统关键设置）。
- 守卫函数见 [`src/lib/permissions/guards.ts`](../src/lib/permissions/guards.ts)：
  - `can(roles, permission)`：布尔判断，用于 UI 层隐藏/禁用操作。
  - `assertPermission(roles, permission)`：服务端断言，无权限时抛出 `AppError("PERMISSION_DENIED")`，供 `lib/repositories` / `lib/services` 的写操作调用。
  - `assertAuthenticated(userId)`、`assertOwnsResource(ownerId, currentUserId)`：分别处理未登录与越权访问自身数据的场景。

## 原则

- 权限判断必须同时存在于：**UI 层**（隐藏/禁用不可用操作）与 **数据访问层**（服务端校验，拒绝越权请求）——后者是唯一可信来源，前端隐藏仅为体验优化。
- `_own` 后缀的操作（如 `product:update_own`）表示仅能操作归属于自己（或所属商家）的数据，具体归属校验由 `assertOwnsResource` 或业务服务层完成，权限矩阵本身只判断角色是否具备该类操作的资格。
- 商家后台与平台后台的路由保护将在 Stage 05 / Stage 07 分别接入实际的登录态与角色校验（当前为纯逻辑层，尚未接入 Next.js 中间件/路由守卫）。
