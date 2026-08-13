/**
 * 种子数据 SQL 生成器（参考实现，非完整迁移工具）。
 *
 * 用途：将 src/data/mock/ 中的 TypeScript 演示数据转换为可在真实 Supabase 项目执行的
 * INSERT 语句，用于搭建测试/演示环境，帮助验证 supabase/migrations/ 建立的表结构与 RLS 策略。
 *
 * 覆盖范围（有意收窄，作为可扩展的参考模式，而非全部 45 张表）：
 *   profiles、user_roles、merchant_applications、merchants、brands、categories、
 *   product_tags、products —— 覆盖「浏览目录」这条最核心链路的完整外键闭环。
 * 其余表（订单、购物车、询价、评价、举报、内容等）请复制本文件的模式自行扩展：
 * 简单扁平实体套用 `serializeEntity()`；字段需要拆分/合并的实体（如本文件中的
 * products，需要把嵌套的 pricing/compliance 对象拆成扁平列）参考 `mapProductRow()` 单独实现。
 *
 * 运行方式：`npm run db:seed:sql`（内部调用 `tsx scripts/generate-seed-sql.ts`），
 * 生成结果写入 `supabase/seed/generated-seed.sql`（不会自动执行、不会连接任何真实数据库）。
 *
 * 重要提醒：
 *   - 生成的 UUID 由原始 mock 字符串 ID 通过确定性 UUID v5 派生，同一 ID 每次生成结果一致，
 *     便于跨表外键引用对齐；但这些 UUID 与真实业务无关，仅用于演示/测试环境。
 *   - 不建议在真实生产 Supabase 项目导入这些虚构的品牌/商家/商品数据。
 */

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  mockBrands,
  mockCategories,
  mockMerchantApplications,
  mockMerchants,
  mockProductTagRelations,
  mockProductTags,
  mockProducts,
  mockProfiles,
  mockUserRoleAssignments,
} from "../src/data/mock/index";

const __dirname = dirname(fileURLToPath(import.meta.url));

// RFC 4122 UUID v5，命名空间任取一个固定 UUID 常量（不必与官方保留命名空间一致，
// 只需在本项目内保持稳定，使同一输入始终映射到同一输出）。
const SEED_NAMESPACE = "8f14e45f-ceea-467e-bd6a-90d8a6b3e7f1";

function uuidV5(name: string, namespace: string = SEED_NAMESPACE): string {
  const namespaceBytes = Buffer.from(namespace.replace(/-/g, ""), "hex");
  const nameBytes = Buffer.from(name, "utf8");
  const hash = createHash("sha1")
    .update(Buffer.concat([namespaceBytes, nameBytes]))
    .digest();
  const bytes = hash.subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant RFC4122
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** 记录「原始 mock 字符串 ID -> 生成的 uuid」，供后续表的外键引用复用同一映射。 */
const idMap = new Map<string, string>();
function resolveId(rawId: string | null | undefined): string | null {
  if (!rawId) return null;
  if (!idMap.has(rawId)) {
    idMap.set(rawId, uuidV5(rawId));
  }
  return idMap.get(rawId)!;
}

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlJsonb(value: unknown): string {
  return `${sqlString(JSON.stringify(value))}::jsonb`;
}

function sqlArray(values: string[]): string {
  if (values.length === 0) return "'{}'";
  return `ARRAY[${values.map(sqlString).join(", ")}]::text[]`;
}

function toSnakeCase(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

type FieldMap = Record<
  string,
  "id" | "fk" | "string" | "number" | "boolean" | "json" | "array" | "raw"
>;

/**
 * 通用扁平实体序列化：按 `fieldTypes` 声明的字段类型逐列生成 VALUES。
 * `idFields` 中列出的字段会被当作外键，通过 `resolveId()` 转换为确定性 UUID。
 */
function serializeEntity(
  table: string,
  rows: Record<string, unknown>[],
  fieldTypes: FieldMap,
): string {
  if (rows.length === 0) return `-- ${table}: 无数据\n`;

  const columns = Object.keys(fieldTypes).map(toSnakeCase);
  const valueLines = rows.map((row) => {
    const values = Object.entries(fieldTypes).map(([field, type]) => {
      const raw = row[field];
      switch (type) {
        case "id":
        case "fk":
          return raw ? sqlString(resolveId(raw as string)!) : "NULL";
        case "boolean":
          return raw === null || raw === undefined ? "NULL" : raw ? "true" : "false";
        case "number":
          return raw === null || raw === undefined ? "NULL" : String(raw);
        case "json":
          return raw === null || raw === undefined ? "NULL" : sqlJsonb(raw);
        case "array":
          return sqlArray((raw as string[] | undefined) ?? []);
        case "string":
        default:
          return raw === null || raw === undefined ? "NULL" : sqlString(String(raw));
      }
    });
    return `  (${values.join(", ")})`;
  });

  return (
    `insert into ${table} (${columns.join(", ")}) values\n` +
    `${valueLines.join(",\n")}\n` +
    `on conflict (id) do nothing;\n`
  );
}

function generateProfiles(): string {
  return serializeEntity("profiles", mockProfiles as unknown as Record<string, unknown>[], {
    id: "id",
    authUserId: "string", // 演示数据的 auth_user_id 非真实 Supabase Auth 用户，导入前需替换
    displayName: "string",
    avatarUrl: "string",
    email: "string",
    phone: "string",
    primaryProvider: "string",
    mainSiteUserId: "string",
    locale: "string",
    status: "string",
    lastLoginAt: "string",
    createdAt: "string",
    updatedAt: "string",
  });
}

function generateUserRoles(): string {
  return serializeEntity(
    "user_roles",
    mockUserRoleAssignments as unknown as Record<string, unknown>[],
    {
      id: "id",
      userId: "fk",
      role: "string",
      grantedAt: "string",
      grantedBy: "fk",
      createdAt: "string",
      updatedAt: "string",
    },
  );
}

function generateMerchantApplications(): string {
  return serializeEntity(
    "merchant_applications",
    mockMerchantApplications as unknown as Record<string, unknown>[],
    {
      id: "id",
      applicantUserId: "fk",
      merchantType: "string",
      legalName: "string",
      country: "string",
      city: "string",
      contactName: "string",
      contactPhone: "string",
      contactEmail: "string",
      wechatId: "string",
      wechatQrCodeUrl: "string",
      mainCategories: "array",
      introduction: "string",
      identityOrCompanyDocs: "array",
      sourcingCapability: "string",
      shippingOrigin: "string",
      afterSalesPolicy: "string",
      wantsPlatformTransaction: "boolean",
      status: "string",
      reviewerId: "fk",
      reviewNote: "string",
      reviewedAt: "string",
      createdAt: "string",
      updatedAt: "string",
    },
  );
}

function generateMerchants(): string {
  return serializeEntity("merchants", mockMerchants as unknown as Record<string, unknown>[], {
    id: "id",
    slug: "string",
    applicationId: "fk",
    name: "json",
    logoUrl: "string",
    heroImageUrl: "string",
    city: "string",
    country: "string",
    introduction: "json",
    merchantType: "string",
    verificationLevels: "array",
    mainCategories: "array",
    contactPhone: "string",
    contactEmail: "string",
    wechatId: "string",
    wechatQrCodeUrl: "string",
    shippingOrigin: "string",
    afterSalesPolicy: "json",
    supportsPlatformGuarantee: "boolean",
    ratingAverage: "number",
    ratingCount: "number",
    storeStatus: "string",
    joinedAt: "string",
    createdAt: "string",
    updatedAt: "string",
  });
}

function generateBrands(): string {
  return serializeEntity("brands", mockBrands as unknown as Record<string, unknown>[], {
    id: "id",
    slug: "string",
    name: "json",
    logoUrl: "string",
    heroImageUrl: "string",
    story: "json",
    city: "string",
    foundedYear: "number",
    categoryTags: "array",
    relationship: "string",
    isFeatured: "boolean",
    sortOrder: "number",
    createdAt: "string",
    updatedAt: "string",
  });
}

function generateCategories(): string {
  return serializeEntity("categories", mockCategories as unknown as Record<string, unknown>[], {
    id: "id",
    slug: "string",
    name: "json",
    description: "json",
    iconUrl: "string",
    parentId: "fk",
    sortOrder: "number",
    isVisible: "boolean",
    createdAt: "string",
    updatedAt: "string",
  });
}

function generateProductTags(): string {
  return serializeEntity("product_tags", mockProductTags as unknown as Record<string, unknown>[], {
    id: "id",
    key: "string",
    label: "json",
    description: "json",
    colorToken: "string",
    createdAt: "string",
    updatedAt: "string",
  });
}

/** products 表在数据库中把嵌套的 pricing/compliance 对象拆成了扁平列，需单独映射（不套用通用序列化）。 */
function generateProducts(): string {
  if (mockProducts.length === 0) return "-- products: 无数据\n";

  const columns = [
    "id",
    "slug",
    "publisher_type",
    "merchant_id",
    "brand_id",
    "category_id",
    "name",
    "summary",
    "story",
    "materials",
    "dimensions",
    "collectible_value_note",
    "authenticity_note",
    "source_city",
    "source_store",
    "estimated_arrival_at",
    "status",
    "reviewer_id",
    "review_note",
    "trade_modes",
    "price_original",
    "price_original_currency",
    "price_cny_reference",
    "price_eur_reference",
    "price_display_mode",
    "price_includes_italy_domestic_shipping",
    "price_includes_international_shipping",
    "price_includes_domestic_shipping",
    "price_includes_daigou_service_fee",
    "price_includes_tax",
    "price_is_all_in",
    "price_requires_deposit",
    "price_deposit_amount",
    "price_valid_until",
    "compliance_age_restricted",
    "compliance_minimum_age",
    "compliance_restricted_regions",
    "compliance_status",
    "compliance_requires_manual_review",
    "compliance_legal_notice_id",
    "favorite_count",
    "view_count",
    "is_featured",
    "published_at",
    "created_at",
    "updated_at",
  ];

  const valueLines = mockProducts.map((p) => {
    const values = [
      sqlString(resolveId(p.id)!),
      sqlString(p.slug),
      sqlString(p.publisherType),
      p.merchantId ? sqlString(resolveId(p.merchantId)!) : "NULL",
      p.brandId ? sqlString(resolveId(p.brandId)!) : "NULL",
      sqlString(resolveId(p.categoryId)!),
      sqlJsonb(p.name),
      p.summary ? sqlJsonb(p.summary) : "NULL",
      p.story ? sqlJsonb(p.story) : "NULL",
      p.materials ? sqlJsonb(p.materials) : "NULL",
      p.dimensions ? sqlString(p.dimensions) : "NULL",
      p.collectibleValueNote ? sqlJsonb(p.collectibleValueNote) : "NULL",
      p.authenticityNote ? sqlJsonb(p.authenticityNote) : "NULL",
      p.sourceCity ? sqlString(p.sourceCity) : "NULL",
      p.sourceStore ? sqlString(p.sourceStore) : "NULL",
      p.estimatedArrivalAt ? sqlString(p.estimatedArrivalAt) : "NULL",
      sqlString(p.status),
      p.reviewerId ? sqlString(resolveId(p.reviewerId)!) : "NULL",
      p.reviewNote ? sqlString(p.reviewNote) : "NULL",
      sqlArray(p.tradeModes),
      String(p.pricing.originalPrice),
      sqlString(p.pricing.originalCurrency),
      p.pricing.cnyReferencePrice !== null ? String(p.pricing.cnyReferencePrice) : "NULL",
      p.pricing.eurReferencePrice !== null ? String(p.pricing.eurReferencePrice) : "NULL",
      sqlString(p.pricing.displayMode),
      p.pricing.includesItalyDomesticShipping ? "true" : "false",
      p.pricing.includesInternationalShipping ? "true" : "false",
      p.pricing.includesDomesticShipping ? "true" : "false",
      p.pricing.includesDaigouServiceFee ? "true" : "false",
      p.pricing.includesTax ? "true" : "false",
      p.pricing.isAllInPrice ? "true" : "false",
      p.pricing.requiresDeposit ? "true" : "false",
      p.pricing.depositAmount !== null ? String(p.pricing.depositAmount) : "NULL",
      p.pricing.priceValidUntil ? sqlString(p.pricing.priceValidUntil) : "NULL",
      p.compliance.ageRestricted ? "true" : "false",
      p.compliance.minimumAge !== null ? String(p.compliance.minimumAge) : "NULL",
      sqlArray(p.compliance.restrictedRegions),
      sqlString(p.compliance.complianceStatus),
      p.compliance.requiresManualReview ? "true" : "false",
      p.compliance.legalNoticeId ? sqlString(resolveId(p.compliance.legalNoticeId)!) : "NULL",
      String(p.favoriteCount),
      String(p.viewCount),
      p.isFeatured ? "true" : "false",
      p.publishedAt ? sqlString(p.publishedAt) : "NULL",
      sqlString(p.createdAt),
      sqlString(p.updatedAt),
    ];
    return `  (${values.join(", ")})`;
  });

  return (
    `insert into products (${columns.join(", ")}) values\n` +
    `${valueLines.join(",\n")}\n` +
    `on conflict (id) do nothing;\n`
  );
}

function generateProductTagRelations(): string {
  if (mockProductTagRelations.length === 0) return "-- product_tag_relations: 无数据\n";
  const valueLines = mockProductTagRelations.map(
    (r) =>
      `  (${sqlString(resolveId(r.id)!)}, ${sqlString(resolveId(r.productId)!)}, ${sqlString(r.tagKey)}, ${sqlString(r.createdAt)})`,
  );
  return (
    `insert into product_tag_relations (id, product_id, tag_key, created_at) values\n` +
    `${valueLines.join(",\n")}\n` +
    `on conflict (id) do nothing;\n`
  );
}

function main() {
  const sections = [
    "-- ============================================================================",
    "-- 生成的种子数据 SQL（参考实现）—— 由 scripts/generate-seed-sql.ts 从",
    "-- src/data/mock/ 演示数据生成，仅用于测试/演示环境，不建议导入真实生产项目。",
    "-- 表覆盖范围：profiles, user_roles, merchant_applications, merchants,",
    "-- brands, categories, product_tags, products, product_tag_relations。",
    "-- 其余表请参照本文件模式自行扩展，见 docs/SEED_DATA_IMPORT.md。",
    "-- ============================================================================",
    "",
    "-- 1. 核心账号",
    generateProfiles(),
    generateUserRoles(),
    "-- 2. 商家",
    generateMerchantApplications(),
    generateMerchants(),
    "-- 3. 目录",
    generateBrands(),
    generateCategories(),
    generateProductTags(),
    "-- 4. 商品",
    generateProducts(),
    generateProductTagRelations(),
  ];

  const outputPath = resolve(__dirname, "../supabase/seed/generated-seed.sql");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, sections.join("\n"), "utf8");
  console.log(`已生成种子数据 SQL：${outputPath}`);
  console.log(`共映射 ${idMap.size} 个确定性 UUID（原始 mock 字符串 ID -> uuid）。`);
}

main();
