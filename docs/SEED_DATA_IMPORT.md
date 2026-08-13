# 种子数据导入说明（SEED_DATA_IMPORT）

> 状态：Stage 10 已完成参考实现。本文档说明如何将 `src/data/mock/` 中的演示数据迁移为可在真实 Supabase 项目执行的 SQL，供测试/演示环境使用；**不建议将这些虚构的品牌、商家、商品数据导入真实生产项目**。

## 1. 背景

第一期（Stage 00-10）全程使用 `src/data/mock/` 中的内存数组作为数据源（详见 `docs/DATABASE_SCHEMA.md` 「第一期数据层实现」一节），未连接任何真实数据库。`supabase/migrations/` 已建立完整表结构与 RLS 策略草案，但表本身是空的。本工具用于快速生成一批可执行的 `INSERT` 语句，帮助在**测试/演示环境**中验证迁移文件与页面联调是否正确，而非用于生产环境的真实业务数据导入。

## 2. 使用方式

```bash
npm run db:seed:sql
```

运行 `scripts/generate-seed-sql.ts`（通过 `tsx` 执行 TypeScript，无需单独编译），生成结果写入 `supabase/seed/generated-seed.sql`（不会自动连接或执行到任何数据库）。生成后需人工核对内容，再自行通过 `psql` / Supabase SQL Editor 等工具在**非生产**项目执行：

```bash
psql "$SUPABASE_DB_URL" -f supabase/seed/generated-seed.sql
```

## 3. 覆盖范围

当前参考实现覆盖「浏览目录」这条最核心链路的完整外键闭环：

`profiles` → `user_roles` → `merchant_applications` → `merchants` → `brands` / `categories` / `product_tags` → `products` → `product_tag_relations`

其余表（购物车、意向清单、询价、订单、评价、举报、内容页、系统设置等约 35 张表）**未包含**在参考实现中，原因：

- 这些表大多依赖上述核心实体的 ID（如 `orders.user_id`、`cart_items.product_id`），需要在核心实体导入成功后才能生成，扩展时可复用同一份 `idMap`（见第 4 节）。
- 覆盖全部 45 张表的生成器体量会显著超过"参考实现"的定位，且每张表的字段映射都需要逐一核对，容易在无人验证的情况下引入静默错误。

## 4. 扩展到其余表

`scripts/generate-seed-sql.ts` 的核心设计可直接复用：

1. **`uuidV5(name)`**：将 mock 数据中的字符串 ID（如 `"product-favilli-enamel-earrings"`）确定性地映射为 `uuid`，同一字符串每次生成结果一致，可跨表复用同一映射维持外键一致性。
2. **`resolveId(rawId)`**：调用 `uuidV5` 并缓存到模块级 `idMap`，后续表只需 `import` 后复用该函数即可与已生成的核心实体对齐 ID。
3. **`serializeEntity(table, rows, fieldTypes)`**：适用于字段可以直接按 `camelCase -> snake_case` 一一对应的扁平实体（多数表满足此条件，因为数据库列名设计时就与 TypeScript 字段名保持了对应关系）。声明每个字段的类型（`id`/`fk`/`string`/`number`/`boolean`/`json`/`array`）即可自动生成正确的 SQL 字面量。
4. **自定义映射函数**：当表结构与 TypeScript 类型不是简单的扁平对应时（如本文件中的 `products`，需要把嵌套的 `pricing`/`compliance` 对象拆分成 `price_*`/`compliance_*` 前缀的独立列），参考 `generateProducts()` 单独手写映射逻辑。

扩展步骤示例（以 `orders` 为例）：

```ts
import { mockOrders } from "../src/data/mock/index";

function generateOrders(): string {
  return serializeEntity("orders", mockOrders as unknown as Record<string, unknown>[], {
    id: "id",
    orderNumber: "string",
    userId: "fk",
    merchantId: "fk",
    orderKind: "string",
    status: "string",
    currency: "string",
    itemsSubtotal: "number",
    // ...按 supabase/migrations/0006_orders_and_fulfillment.sql 的列逐一补全
    createdAt: "string",
    updatedAt: "string",
  });
}
```

再将 `generateOrders()` 的返回值加入 `main()` 的 `sections` 数组即可。

## 5. 已知限制

- `profiles.auth_user_id` 在 mock 数据中是虚构字符串（如 `"auth-user-zhangming"`），并非真实 Supabase Auth 用户的 UUID。若要在真实项目中让这些 `profiles` 记录与实际登录账号对应，需要先在 Supabase Auth 创建对应用户，再用真实 `auth_user_id` 替换生成结果中的对应值。
- 生成的 SQL 使用 `on conflict (id) do nothing`，重复执行是幂等的，但也意味着若需要更新已存在的记录需另外处理。
- 图片/文件类字段（`logo_url`、`wechat_qr_code_url` 等）指向 `/images/placeholder/...` 路径，实际并不存在真实文件，仅作为数据完整性演示。
