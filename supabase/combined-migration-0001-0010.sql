-- ============================================================================
-- 0001_extensions_and_core.sql
-- 扩展、公共约定与核心账号实体（shop.profiles、shop.user_roles）。
--
-- 通用约定（后续迁移文件均遵循）：
--   - 全部业务表位于独立的 `shop` schema 下，与「意料之中」主站、「意租」共用
--     同一个 Supabase 项目时互不冲突（仅共享 auth schema 下的 auth.users 表）。
--     见 docs/MAIN_SITE_INTEGRATION.md。
--   - 主键统一为 uuid，默认 gen_random_uuid()
--   - created_at / updated_at：timestamptz not null default now()
--   - deleted_at：timestamptz，软删除标记，null 表示未删除
--   - created_by / updated_by：references shop.profiles(id)，可为 null（系统/种子数据）
--   - RLS（行级安全策略）将在 Stage 08（合规与安全）阶段随认证接入正式编写，
--     本阶段仅建表结构，暂不遗留 "允许所有访问" 的宽松占位策略。
-- ============================================================================

create extension if not exists "pgcrypto";

create schema if not exists shop;

create table if not exists shop.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,
  display_name text not null,
  avatar_url text,
  email text,
  phone text,
  primary_provider text not null default 'email'
    check (primary_provider in ('email', 'phone', 'wechat', 'main_site_sso')),
  main_site_user_id uuid, -- 主站账号互通映射，见 docs/MAIN_SITE_INTEGRATION.md
  locale text not null default 'zh-CN' check (locale in ('zh-CN', 'it-IT', 'en-US')),
  status text not null default 'active' check (status in ('active', 'suspended', 'banned')),
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create unique index if not exists profiles_email_unique on shop.profiles (email) where deleted_at is null and email is not null;
create index if not exists profiles_main_site_user_id_idx on shop.profiles (main_site_user_id) where deleted_at is null;

create table if not exists shop.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references shop.profiles(id) on delete cascade,
  role text not null check (role in (
    'guest', 'user', 'merchant_applicant', 'merchant', 'platform_operator',
    'content_editor', 'customer_service', 'product_reviewer', 'merchant_reviewer',
    'admin', 'super_admin'
  )),
  granted_at timestamptz not null default now(),
  granted_by uuid references shop.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id),
  unique (user_id, role)
);

create index if not exists user_roles_user_id_idx on shop.user_roles (user_id) where deleted_at is null;

create table if not exists shop.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references shop.profiles(id) on delete cascade,
  recipient_name text not null,
  phone text not null,
  country text not null,
  province text,
  city text not null,
  district text,
  detail text not null,
  postal_code text,
  is_default boolean not null default false,
  label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists addresses_user_id_idx on shop.addresses (user_id) where deleted_at is null;
-- ============================================================================
-- 0002_catalog.sql
-- 商品分类与交易标签目录：shop.brands、shop.categories、shop.product_tags。
-- ============================================================================

create table if not exists shop.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null, -- LocalizedText：{"zh-CN": "...", "en-US": "...", "it-IT": "..."}
  logo_url text,
  hero_image_url text,
  story jsonb,
  city text,
  founded_year int,
  category_tags text[] not null default '{}',
  relationship text not null default 'unofficial_selection'
    check (relationship in ('unofficial_selection', 'authorized_partner', 'platform_owned')),
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists brands_sort_order_idx on shop.brands (sort_order) where deleted_at is null;

create table if not exists shop.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null,
  description jsonb,
  icon_url text,
  parent_id uuid references shop.categories(id),
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists categories_parent_id_idx on shop.categories (parent_id) where deleted_at is null;
create index if not exists categories_sort_order_idx on shop.categories (sort_order) where deleted_at is null;

create table if not exists shop.product_tags (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key in (
    'italy_in_stock', 'domestic_in_stock', 'preorder', 'daigou', 'group_buy',
    'inquiry_only', 'limited', 'exclusive', 'arriving_soon', 'sold_out'
  )),
  label jsonb not null,
  description jsonb,
  color_token text not null default 'tag-neutral',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);
-- ============================================================================
-- 0003_merchants.sql
-- 商家入驻与商家档案：shop.merchant_applications、shop.merchants、shop.merchant_members、shop.merchant_verifications。
-- ============================================================================

create table if not exists shop.merchant_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_user_id uuid not null references shop.profiles(id),
  merchant_type text not null check (merchant_type in ('individual', 'company')),
  legal_name text not null,
  country text not null,
  city text not null,
  contact_name text not null,
  contact_phone text not null,
  contact_email text not null,
  wechat_id text,
  wechat_qr_code_url text,
  main_categories text[] not null default '{}',
  introduction text not null,
  identity_or_company_docs text[] not null default '{}',
  sourcing_capability text not null,
  shipping_origin text not null,
  after_sales_policy text not null,
  wants_platform_transaction boolean not null default false,
  status text not null default 'draft' check (status in (
    'draft', 'submitted', 'in_review', 'needs_more_info', 'approved', 'rejected'
  )),
  reviewer_id uuid references shop.profiles(id),
  review_note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists merchant_applications_applicant_idx on shop.merchant_applications (applicant_user_id) where deleted_at is null;
create index if not exists merchant_applications_status_idx on shop.merchant_applications (status) where deleted_at is null;

create table if not exists shop.merchants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  application_id uuid references shop.merchant_applications(id),
  name jsonb not null,
  logo_url text,
  hero_image_url text,
  city text not null,
  country text not null,
  introduction jsonb not null,
  merchant_type text not null check (merchant_type in ('individual', 'company')),
  verification_levels text[] not null default '{}',
  main_categories text[] not null default '{}',
  contact_phone text,
  contact_email text,
  wechat_id text,
  wechat_qr_code_url text,
  shipping_origin text not null,
  after_sales_policy jsonb not null,
  supports_platform_guarantee boolean not null default false,
  rating_average numeric(3, 2) not null default 0,
  rating_count int not null default 0,
  store_status text not null default 'active' check (store_status in ('active', 'paused', 'suspended', 'banned')),
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists merchants_store_status_idx on shop.merchants (store_status) where deleted_at is null;
create index if not exists merchants_city_idx on shop.merchants (city) where deleted_at is null;

create table if not exists shop.merchant_members (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references shop.merchants(id) on delete cascade,
  user_id uuid not null references shop.profiles(id),
  role text not null default 'staff' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id),
  unique (merchant_id, user_id)
);

create table if not exists shop.merchant_verifications (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references shop.merchants(id) on delete cascade,
  level text not null check (level in (
    'individual_verified', 'company_verified', 'italy_local_verified',
    'platform_partner', 'platform_owned'
  )),
  document_urls text[] not null default '{}',
  verified_by uuid references shop.profiles(id),
  verified_at timestamptz,
  expires_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists merchant_verifications_merchant_idx on shop.merchant_verifications (merchant_id) where deleted_at is null;
-- ============================================================================
-- 0004_products.sql
-- 商品核心实体：shop.products、shop.product_variants、shop.product_media、shop.product_tag_relations、shop.inventories。
-- ============================================================================

create table if not exists shop.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  publisher_type text not null check (publisher_type in ('platform', 'merchant')),
  merchant_id uuid references shop.merchants(id), -- publisher_type = 'platform' 时为 null
  brand_id uuid references shop.brands(id),
  category_id uuid not null references shop.categories(id),
  name jsonb not null,
  summary jsonb,
  story jsonb,
  materials jsonb,
  dimensions text,
  collectible_value_note jsonb,
  authenticity_note jsonb,
  source_city text,
  source_store text,
  estimated_arrival_at timestamptz,
  status text not null default 'draft' check (status in (
    'draft', 'pending_review', 'changes_requested', 'published', 'rejected', 'off_shelf'
  )),
  reviewer_id uuid references shop.profiles(id),
  review_note text,
  trade_modes text[] not null default '{}',

  -- 价格字段（ProductPricing）
  price_original numeric(12, 2) not null,
  price_original_currency text not null check (price_original_currency in ('EUR', 'CNY', 'USD')),
  price_cny_reference numeric(12, 2),
  price_eur_reference numeric(12, 2),
  price_display_mode text not null default 'both'
    check (price_display_mode in ('cny_only', 'eur_only', 'both', 'reference_only', 'inquiry_only')),
  price_includes_italy_domestic_shipping boolean not null default false,
  price_includes_international_shipping boolean not null default false,
  price_includes_domestic_shipping boolean not null default false,
  price_includes_daigou_service_fee boolean not null default false,
  price_includes_tax boolean not null default false,
  price_is_all_in boolean not null default false,
  price_requires_deposit boolean not null default false,
  price_deposit_amount numeric(12, 2),
  price_valid_until timestamptz,

  -- 合规字段（ProductCompliance），详见 docs/COMPLIANCE.md
  compliance_age_restricted boolean not null default false,
  compliance_minimum_age int,
  compliance_restricted_regions text[] not null default '{}',
  compliance_status text not null default 'not_required'
    check (compliance_status in ('not_required', 'pending_review', 'approved', 'rejected')),
  compliance_requires_manual_review boolean not null default false,
  compliance_legal_notice_id uuid,

  favorite_count int not null default 0,
  view_count int not null default 0,
  is_featured boolean not null default false,
  published_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id),

  constraint products_merchant_publisher_chk check (
    (publisher_type = 'platform' and merchant_id is null) or
    (publisher_type = 'merchant' and merchant_id is not null)
  )
);

create index if not exists products_status_idx on shop.products (status) where deleted_at is null;
create index if not exists products_category_idx on shop.products (category_id) where deleted_at is null;
create index if not exists products_brand_idx on shop.products (brand_id) where deleted_at is null;
create index if not exists products_merchant_idx on shop.products (merchant_id) where deleted_at is null;
create index if not exists products_compliance_status_idx on shop.products (compliance_status) where deleted_at is null;

create table if not exists shop.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references shop.products(id) on delete cascade,
  sku text not null,
  option_label jsonb not null,
  price_override numeric(12, 2),
  stock_quantity int not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id),
  unique (product_id, sku)
);

create index if not exists product_variants_product_idx on shop.product_variants (product_id) where deleted_at is null;

create table if not exists shop.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references shop.products(id) on delete cascade,
  type text not null check (type in ('image', 'video', 'spin360')),
  url text not null,
  alt_text text not null default '',
  is_cover boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists product_media_product_idx on shop.product_media (product_id, sort_order) where deleted_at is null;

create table if not exists shop.product_tag_relations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references shop.products(id) on delete cascade,
  tag_key text not null references shop.product_tags(key),
  created_at timestamptz not null default now(),
  unique (product_id, tag_key)
);

create index if not exists product_tag_relations_product_idx on shop.product_tag_relations (product_id);
create index if not exists product_tag_relations_tag_idx on shop.product_tag_relations (tag_key);

create table if not exists shop.inventories (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references shop.products(id) on delete cascade,
  variant_id uuid references shop.product_variants(id) on delete cascade,
  quantity_available int not null default 0,
  quantity_reserved int not null default 0,
  track_inventory boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists inventories_product_idx on shop.inventories (product_id) where deleted_at is null;
-- ============================================================================
-- 0005_commerce.sql
-- 购物车、意向清单、询价与代购需求：
-- shop.carts, shop.cart_items, shop.wishlists, shop.wishlist_items,
-- shop.inquiries, shop.inquiry_messages, shop.merchant_quotes, shop.custom_purchase_requests。
-- ============================================================================

create table if not exists shop.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references shop.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create table if not exists shop.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references shop.carts(id) on delete cascade,
  product_id uuid not null references shop.products(id),
  variant_id uuid references shop.product_variants(id),
  quantity int not null default 1 check (quantity > 0),
  price_snapshot_id uuid, -- 引用 shop.price_snapshots，见 0007
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists cart_items_cart_idx on shop.cart_items (cart_id) where deleted_at is null;

create table if not exists shop.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references shop.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create table if not exists shop.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references shop.wishlists(id) on delete cascade,
  product_id uuid not null references shop.products(id),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id),
  unique (wishlist_id, product_id)
);

create table if not exists shop.inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references shop.profiles(id),
  product_id uuid not null references shop.products(id),
  variant_id uuid references shop.product_variants(id),
  merchant_id uuid not null references shop.merchants(id),
  quantity int not null default 1 check (quantity > 0),
  budget_amount numeric(12, 2),
  budget_currency text check (budget_currency in ('EUR', 'CNY', 'USD')),
  message text not null,
  contact_method text not null default 'in_site' check (contact_method in ('in_site', 'wechat', 'phone')),
  contact_value text,
  status text not null default 'pending_merchant_reply' check (status in (
    'pending_merchant_reply', 'quoted', 'viewed_by_user', 'negotiating', 'agreed', 'cancelled', 'expired'
  )),
  latest_quote_id uuid, -- 引用 shop.merchant_quotes(id)，建表后由应用层维护，避免循环外键
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists inquiries_user_idx on shop.inquiries (user_id) where deleted_at is null;
create index if not exists inquiries_merchant_idx on shop.inquiries (merchant_id) where deleted_at is null;
create index if not exists inquiries_status_idx on shop.inquiries (status) where deleted_at is null;

create table if not exists shop.inquiry_messages (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references shop.inquiries(id) on delete cascade,
  sender_id uuid not null references shop.profiles(id),
  sender_role text not null check (sender_role in ('user', 'merchant')),
  body text not null,
  attachment_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists inquiry_messages_inquiry_idx on shop.inquiry_messages (inquiry_id, created_at) where deleted_at is null;

create table if not exists shop.merchant_quotes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references shop.inquiries(id) on delete cascade,
  merchant_id uuid not null references shop.merchants(id),
  quoted_price numeric(12, 2) not null,
  quoted_currency text not null check (quoted_currency in ('EUR', 'CNY', 'USD')),
  shipping_fee numeric(12, 2),
  service_fee numeric(12, 2),
  tax_fee numeric(12, 2),
  valid_until timestamptz,
  note text,
  status text not null default 'active' check (status in ('active', 'accepted', 'expired', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists merchant_quotes_inquiry_idx on shop.merchant_quotes (inquiry_id) where deleted_at is null;

alter table shop.inquiries
  add constraint inquiries_latest_quote_fk foreign key (latest_quote_id) references shop.merchant_quotes(id);

create table if not exists shop.custom_purchase_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references shop.profiles(id),
  product_name text not null,
  brand_name text,
  reference_url text,
  reference_image_urls text[] not null default '{}',
  expected_spec text,
  budget_amount numeric(12, 2),
  budget_currency text check (budget_currency in ('EUR', 'CNY', 'USD')),
  quantity int not null default 1 check (quantity > 0),
  shipping_city text not null,
  expected_by_date timestamptz,
  accepts_similar_alternatives boolean not null default false,
  prefers_platform_transaction boolean not null default false,
  visibility text not null default 'platform_only'
    check (visibility in ('platform_only', 'specific_merchants', 'all_verified_merchants')),
  visible_merchant_ids uuid[] not null default '{}',
  note text,
  status text not null default 'open' check (status in ('open', 'matched', 'closed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists custom_purchase_requests_user_idx on shop.custom_purchase_requests (user_id) where deleted_at is null;
create index if not exists custom_purchase_requests_status_idx on shop.custom_purchase_requests (status) where deleted_at is null;
-- ============================================================================
-- 0006_orders_and_fulfillment.sql
-- 订单、履约与拼单/预订：
-- shop.orders, shop.order_items, shop.order_status_history, shop.purchase_progress,
-- shop.group_buys, shop.group_buy_members, shop.preorders。
-- ============================================================================

create table if not exists shop.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references shop.profiles(id),
  merchant_id uuid references shop.merchants(id), -- 平台自营时为 null
  order_kind text not null check (order_kind in ('platform', 'self_negotiated')),
  status text not null,
  currency text not null check (currency in ('EUR', 'CNY', 'USD')),
  items_subtotal numeric(12, 2) not null default 0,
  shipping_fee numeric(12, 2),
  service_fee numeric(12, 2),
  tax_fee numeric(12, 2),
  deposit_amount numeric(12, 2),
  total_amount numeric(12, 2) not null default 0,
  address_id uuid references shop.addresses(id),
  contact_phone text,
  payment_enabled_snapshot boolean not null default false,
  cancelled_reason text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id),

  constraint orders_status_matches_kind_chk check (
    (order_kind = 'self_negotiated' and status in (
      'contacted_merchant', 'negotiating', 'agreed_with_merchant', 'cancelled', 'user_marked_completed'
    )) or
    (order_kind = 'platform' and status in (
      'submitted', 'awaiting_merchant_confirmation', 'awaiting_payment', 'paid',
      'sourcing_in_italy', 'sourcing_completed', 'italy_domestic_shipping',
      'international_shipping', 'customs_clearance', 'domestic_delivery',
      'completed', 'after_sales', 'refunded', 'cancelled'
    ))
  )
);

create index if not exists orders_user_idx on shop.orders (user_id) where deleted_at is null;
create index if not exists orders_merchant_idx on shop.orders (merchant_id) where deleted_at is null;
create index if not exists orders_status_idx on shop.orders (status) where deleted_at is null;
create index if not exists orders_kind_idx on shop.orders (order_kind) where deleted_at is null;

create table if not exists shop.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references shop.orders(id) on delete cascade,
  product_id uuid not null references shop.products(id),
  variant_id uuid references shop.product_variants(id),
  quantity int not null default 1 check (quantity > 0),
  unit_price numeric(12, 2) not null,
  currency text not null check (currency in ('EUR', 'CNY', 'USD')),
  price_snapshot_id uuid,
  product_name_snapshot text not null,
  product_image_snapshot text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists order_items_order_idx on shop.order_items (order_id) where deleted_at is null;

create table if not exists shop.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references shop.orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references shop.profiles(id),
  note text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists order_status_history_order_idx on shop.order_status_history (order_id, occurred_at);

create table if not exists shop.purchase_progress (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references shop.orders(id) on delete cascade,
  stage text not null check (stage in (
    'sourcing_in_italy', 'sourcing_completed', 'italy_domestic_shipping',
    'international_shipping', 'customs_clearance', 'domestic_delivery', 'completed'
  )),
  note text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists purchase_progress_order_idx on shop.purchase_progress (order_id, occurred_at);

create table if not exists shop.group_buys (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references shop.products(id),
  merchant_id uuid not null references shop.merchants(id),
  target_quantity int not null check (target_quantity > 0),
  current_quantity int not null default 0,
  price_per_unit numeric(12, 2) not null,
  currency text not null check (currency in ('EUR', 'CNY', 'USD')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'open' check (status in ('open', 'succeeded', 'failed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists group_buys_product_idx on shop.group_buys (product_id) where deleted_at is null;
create index if not exists group_buys_status_idx on shop.group_buys (status) where deleted_at is null;

create table if not exists shop.group_buy_members (
  id uuid primary key default gen_random_uuid(),
  group_buy_id uuid not null references shop.group_buys(id) on delete cascade,
  user_id uuid not null references shop.profiles(id),
  quantity int not null default 1 check (quantity > 0),
  order_id uuid references shop.orders(id),
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists group_buy_members_group_buy_idx on shop.group_buy_members (group_buy_id) where deleted_at is null;

create table if not exists shop.preorders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references shop.products(id),
  merchant_id uuid not null references shop.merchants(id),
  user_id uuid not null references shop.profiles(id),
  quantity int not null default 1 check (quantity > 0),
  deposit_amount numeric(12, 2),
  deposit_currency text check (deposit_currency in ('EUR', 'CNY', 'USD')),
  expected_arrival_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'fulfilled', 'cancelled')),
  order_id uuid references shop.orders(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists preorders_user_idx on shop.preorders (user_id) where deleted_at is null;
create index if not exists preorders_merchant_idx on shop.preorders (merchant_id) where deleted_at is null;
-- ============================================================================
-- 0007_pricing_and_payments.sql
-- 汇率、价格快照与支付预留结构：
-- shop.exchange_rates, shop.price_snapshots, shop.payments, shop.payment_transactions, shop.refunds。
--
-- 支付相关表为第一期预留结构，payment_enabled 功能开关默认 false，
-- 应用层不接入任何真实支付网关，详见 docs/PAYMENT_RESERVATION.md。
-- ============================================================================

create table if not exists shop.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  base_currency text not null check (base_currency in ('EUR', 'CNY', 'USD')),
  quote_currency text not null check (quote_currency in ('EUR', 'CNY', 'USD')),
  rate numeric(14, 6) not null,
  source text not null default 'manual' check (source in ('manual', 'external_api')),
  effective_at timestamptz not null default now(),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists exchange_rates_pair_active_idx on shop.exchange_rates (base_currency, quote_currency, is_active) where deleted_at is null;

create table if not exists shop.price_snapshots (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references shop.products(id),
  variant_id uuid references shop.product_variants(id),
  original_price numeric(12, 2) not null,
  original_currency text not null check (original_currency in ('EUR', 'CNY', 'USD')),
  cny_reference_price numeric(12, 2),
  eur_reference_price numeric(12, 2),
  exchange_rate_id uuid references shop.exchange_rates(id),
  captured_at timestamptz not null default now(),
  context text not null check (context in ('cart', 'inquiry', 'order', 'quote')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists price_snapshots_product_idx on shop.price_snapshots (product_id);

alter table shop.cart_items add constraint cart_items_price_snapshot_fk foreign key (price_snapshot_id) references shop.price_snapshots(id);
alter table shop.order_items add constraint order_items_price_snapshot_fk foreign key (price_snapshot_id) references shop.price_snapshots(id);

create table if not exists shop.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references shop.orders(id),
  provider text not null default 'unconfigured' check (provider in ('unconfigured', 'alipay', 'wechat_pay', 'stripe')),
  amount numeric(12, 2) not null,
  currency text not null check (currency in ('EUR', 'CNY', 'USD')),
  status text not null default 'pending' check (status in (
    'pending', 'requires_action', 'succeeded', 'failed', 'cancelled', 'refunded'
  )),
  idempotency_key text not null unique,
  order_amount_snapshot numeric(12, 2) not null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists payments_order_idx on shop.payments (order_id) where deleted_at is null;

create table if not exists shop.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references shop.payments(id) on delete cascade,
  provider text not null check (provider in ('unconfigured', 'alipay', 'wechat_pay', 'stripe')),
  provider_transaction_id text,
  type text not null check (type in ('charge', 'refund', 'webhook_event')),
  amount numeric(12, 2) not null,
  currency text not null check (currency in ('EUR', 'CNY', 'USD')),
  status text not null check (status in (
    'pending', 'requires_action', 'succeeded', 'failed', 'cancelled', 'refunded'
  )),
  log_ref text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists payment_transactions_payment_idx on shop.payment_transactions (payment_id) where deleted_at is null;

create table if not exists shop.refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references shop.payments(id),
  order_id uuid not null references shop.orders(id),
  amount numeric(12, 2) not null,
  currency text not null check (currency in ('EUR', 'CNY', 'USD')),
  reason text not null,
  status text not null default 'requested' check (status in (
    'requested', 'processing', 'succeeded', 'failed', 'cancelled'
  )),
  requested_by uuid not null references shop.profiles(id),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists refunds_order_idx on shop.refunds (order_id) where deleted_at is null;
-- ============================================================================
-- 0008_content_and_editorial.sql
-- 内容管理：shop.content_pages, shop.editorial_collections, shop.editorial_collection_items,
-- shop.city_guides, shop.faqs, shop.legal_documents。
-- ============================================================================

create table if not exists shop.content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  body jsonb not null,
  seo_title text,
  seo_description text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create table if not exists shop.editorial_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  cover_image_url text,
  description jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  is_featured boolean not null default false,
  sort_order int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists editorial_collections_sort_order_idx on shop.editorial_collections (sort_order) where deleted_at is null;

create table if not exists shop.editorial_collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references shop.editorial_collections(id) on delete cascade,
  item_type text not null check (item_type in ('product', 'brand', 'merchant', 'city')),
  item_id uuid not null,
  note jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists editorial_collection_items_collection_idx on shop.editorial_collection_items (collection_id, sort_order) where deleted_at is null;

create table if not exists shop.city_guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  city_name jsonb not null,
  country text not null,
  hero_image_url text,
  introduction jsonb not null,
  featured_brand_ids uuid[] not null default '{}',
  featured_merchant_ids uuid[] not null default '{}',
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create table if not exists shop.faqs (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  question jsonb not null,
  answer jsonb not null,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create table if not exists shop.legal_documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null check (slug in (
    'user-agreement', 'privacy-policy', 'cookie-policy', 'merchant-agreement',
    'self-negotiated-disclaimer', 'platform-transaction-rules', 'product-listing-guidelines',
    'ip-complaint-policy', 'restricted-shop.products-policy', 'minor-protection-notice',
    'after-sales-dispute-rules'
  )),
  title jsonb not null,
  body jsonb not null,
  version text not null,
  effective_at timestamptz not null default now(),
  is_pending_legal_review boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id),
  unique (slug, version)
);

alter table shop.products add constraint products_legal_notice_fk foreign key (compliance_legal_notice_id) references shop.legal_documents(id);
-- ============================================================================
-- 0009_trust_safety_and_settings.sql
-- 评价、举报、通知、合规与系统设置：
-- shop.product_reviews, shop.merchant_reviews, shop.reports, shop.notifications,
-- shop.age_confirmations, shop.audit_logs, shop.system_settings。
-- ============================================================================

create table if not exists shop.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references shop.products(id),
  user_id uuid not null references shop.profiles(id),
  order_id uuid references shop.orders(id),
  rating int not null check (rating between 1 and 5),
  title text,
  body text not null,
  image_urls text[] not null default '{}',
  verification text not null default 'unverified_experience'
    check (verification in ('verified_purchase', 'unverified_experience')),
  merchant_reply text,
  merchant_replied_at timestamptz,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists product_reviews_product_idx on shop.product_reviews (product_id) where deleted_at is null and is_hidden = false;

create table if not exists shop.merchant_reviews (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references shop.merchants(id),
  user_id uuid not null references shop.profiles(id),
  order_id uuid references shop.orders(id),
  rating int not null check (rating between 1 and 5),
  body text not null,
  verification text not null default 'unverified_experience'
    check (verification in ('verified_purchase', 'unverified_experience')),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists merchant_reviews_merchant_idx on shop.merchant_reviews (merchant_id) where deleted_at is null and is_hidden = false;

create table if not exists shop.reports (
  id uuid primary key default gen_random_uuid(),
  reported_type text not null check (reported_type in ('product', 'merchant', 'review', 'content')),
  reported_id uuid not null,
  reporter_id uuid not null references shop.profiles(id),
  category text not null check (category in (
    'infringement', 'false_information', 'restricted_product',
    'suspicious_transaction', 'minor_risk', 'other'
  )),
  description text not null,
  status text not null default 'pending' check (status in (
    'pending', 'investigating', 'resolved', 'dismissed', 'removed', 'banned'
  )),
  handled_by uuid references shop.profiles(id),
  handled_at timestamptz,
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists reports_status_idx on shop.reports (status) where deleted_at is null;

create table if not exists shop.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references shop.profiles(id),
  channel text not null default 'in_site' check (channel in ('in_site', 'email', 'sms', 'wechat_template')),
  scene text not null check (scene in (
    'merchant_application_review', 'product_review', 'inquiry_reply', 'quote_expiring',
    'purchase_progress_update', 'product_arrival', 'price_drop', 'group_buy_succeeded',
    'preorder_confirmed', 'after_sales_update', 'report_handled', 'system_announcement'
  )),
  title text not null,
  body text not null,
  link_url text,
  is_read boolean not null default false,
  read_at timestamptz,
  delivery_status text not null default 'pending' check (delivery_status in ('pending', 'sent', 'failed')),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists notifications_user_idx on shop.notifications (user_id, created_at) where deleted_at is null;
create index if not exists notifications_unread_idx on shop.notifications (user_id) where deleted_at is null and is_read = false;

create table if not exists shop.age_confirmations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references shop.profiles(id),
  session_id text, -- 游客场景下用于替代 user_id
  context_type text not null check (context_type in ('category', 'product')),
  context_id uuid not null,
  minimum_age_required int not null,
  confirmed boolean not null default false,
  confirmed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id),

  constraint age_confirmations_identity_chk check (user_id is not null or session_id is not null)
);

create index if not exists age_confirmations_user_idx on shop.age_confirmations (user_id) where deleted_at is null;

create table if not exists shop.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references shop.profiles(id),
  actor_role text,
  action text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id),
  updated_by uuid references shop.profiles(id)
);

create index if not exists audit_logs_actor_idx on shop.audit_logs (actor_id, occurred_at);
create index if not exists audit_logs_target_idx on shop.audit_logs (target_type, target_id);

create table if not exists shop.system_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  value_type text not null check (value_type in ('boolean', 'number', 'string', 'json')),
  description text,
  updated_by uuid references shop.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references shop.profiles(id)
);

insert into shop.system_settings (key, value, value_type, description) values
  ('payment_enabled', 'false', 'boolean', '平台担保交易支付通道开关，第一期强制为 false'),
  ('wechat_login_enabled', 'false', 'boolean', '微信登录开关，未配置开放平台凭证前保持 false'),
  ('main_site_sso_enabled', 'false', 'boolean', '与 expectaly.com 主站账号互通开关')
on conflict (key) do nothing;
-- ============================================================================
-- 0010_row_level_security.sql
-- 行级安全策略（RLS）草案 —— Stage 08（合规与安全）。
--
-- 重要说明：
--   - 本文件为策略草案，尚未在真实 Supabase 项目上执行，随真实 Supabase Auth 接入时
--     需结合实际 auth.uid() 语义与压力测试重新验证，不构成已生效的安全边界。
--   - 角色判断逻辑对应 src/lib/permissions/matrix.ts 的权限矩阵，两侧变更需同步维护。
--   - 所有策略遵循「默认拒绝」原则：先 enable row level security，
--     再逐条显式授权，未列出的操作（如 delete）默认不可执行。
--   - 软删除记录（deleted_at 非空）不在本文件重复过滤，读策略中按需叠加。
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 辅助函数：角色与归属判断
-- ----------------------------------------------------------------------------

create or replace function shop.app_current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from shop.profiles where auth_user_id = auth.uid() and deleted_at is null limit 1;
$$;

create or replace function shop.app_has_role(check_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from shop.user_roles
    where user_id = shop.app_current_profile_id()
      and role = check_role
      and deleted_at is null
  );
$$;

-- 平台后台角色（对应 AdminNav / admin/layout.tsx 中的 ADMIN_FAMILY_ROLES）
create or replace function shop.app_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from shop.user_roles
    where user_id = shop.app_current_profile_id()
      and role in (
        'platform_operator', 'content_editor', 'customer_service',
        'product_reviewer', 'merchant_reviewer', 'admin', 'super_admin'
      )
      and deleted_at is null
  );
$$;

create or replace function shop.app_is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select shop.app_has_role('super_admin');
$$;

create or replace function shop.app_manages_merchant(check_merchant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from shop.merchant_members
    where merchant_id = check_merchant_id
      and user_id = shop.app_current_profile_id()
      and deleted_at is null
  );
$$;

-- ----------------------------------------------------------------------------
-- 核心账号实体（0001）
-- ----------------------------------------------------------------------------

alter table shop.profiles enable row level security;
create policy profiles_select_self_or_staff on shop.profiles
  for select using (id = shop.app_current_profile_id() or shop.app_is_staff());
create policy profiles_update_self on shop.profiles
  for update using (id = shop.app_current_profile_id()) with check (id = shop.app_current_profile_id());
-- 角色变更（shop.user_roles）不通过 shop.profiles 表本身授权，避免用户自行提权。

alter table shop.user_roles enable row level security;
create policy user_roles_select_self_or_staff on shop.user_roles
  for select using (user_id = shop.app_current_profile_id() or shop.app_is_staff());
create policy user_roles_manage_super_admin_only on shop.user_roles
  for all using (shop.app_is_super_admin()) with check (shop.app_is_super_admin());

alter table shop.addresses enable row level security;
create policy addresses_owner_full_access on shop.addresses
  for all using (user_id = shop.app_current_profile_id()) with check (user_id = shop.app_current_profile_id());
create policy addresses_select_staff on shop.addresses
  for select using (shop.app_is_staff());

-- ----------------------------------------------------------------------------
-- 目录（0002）：公开只读，写入仅限内容/平台管理角色
-- ----------------------------------------------------------------------------

alter table shop.brands enable row level security;
create policy brands_public_read on shop.brands for select using (deleted_at is null);
create policy brands_manage_staff on shop.brands
  for insert with check (shop.app_has_role('content_editor') or shop.app_has_role('admin') or shop.app_is_super_admin());
create policy brands_update_staff on shop.brands
  for update using (shop.app_has_role('content_editor') or shop.app_has_role('admin') or shop.app_is_super_admin());

alter table shop.categories enable row level security;
create policy categories_public_read on shop.categories for select using (deleted_at is null);
create policy categories_manage_admin on shop.categories
  for all using (shop.app_has_role('admin') or shop.app_is_super_admin())
  with check (shop.app_has_role('admin') or shop.app_is_super_admin());

alter table shop.product_tags enable row level security;
create policy product_tags_public_read on shop.product_tags for select using (true);

-- ----------------------------------------------------------------------------
-- 商家（0003）
-- ----------------------------------------------------------------------------

alter table shop.merchant_applications enable row level security;
create policy merchant_applications_owner_select on shop.merchant_applications
  for select using (applicant_user_id = shop.app_current_profile_id() or shop.app_is_staff());
create policy merchant_applications_owner_insert on shop.merchant_applications
  for insert with check (applicant_user_id = shop.app_current_profile_id());
create policy merchant_applications_owner_update_draft on shop.merchant_applications
  for update using (applicant_user_id = shop.app_current_profile_id() and status in ('draft', 'needs_more_info'));
create policy merchant_applications_reviewer_update on shop.merchant_applications
  for update using (shop.app_has_role('merchant_reviewer') or shop.app_has_role('admin') or shop.app_is_super_admin());

alter table shop.merchants enable row level security;
create policy merchants_public_read on shop.merchants
  for select using (deleted_at is null and store_status = 'active');
create policy merchants_select_owner_or_staff on shop.merchants
  for select using (shop.app_manages_merchant(id) or shop.app_is_staff());
create policy merchants_update_owner_or_staff on shop.merchants
  for update using (shop.app_manages_merchant(id) or shop.app_has_role('admin') or shop.app_is_super_admin());

alter table shop.merchant_members enable row level security;
create policy merchant_members_select on shop.merchant_members
  for select using (user_id = shop.app_current_profile_id() or shop.app_manages_merchant(merchant_id) or shop.app_is_staff());
create policy merchant_members_manage_staff on shop.merchant_members
  for all using (shop.app_has_role('admin') or shop.app_is_super_admin())
  with check (shop.app_has_role('admin') or shop.app_is_super_admin());

alter table shop.merchant_verifications enable row level security;
create policy merchant_verifications_select on shop.merchant_verifications
  for select using (shop.app_manages_merchant(merchant_id) or shop.app_is_staff());
create policy merchant_verifications_manage_reviewer on shop.merchant_verifications
  for all using (shop.app_has_role('merchant_reviewer') or shop.app_has_role('admin') or shop.app_is_super_admin())
  with check (shop.app_has_role('merchant_reviewer') or shop.app_has_role('admin') or shop.app_is_super_admin());

-- ----------------------------------------------------------------------------
-- 商品（0004）：published 商品公开可读，其余仅商家自身与审核/管理角色可见
-- ----------------------------------------------------------------------------

alter table shop.products enable row level security;
create policy products_public_read_published on shop.products
  for select using (deleted_at is null and status = 'published');
create policy products_select_owner_or_staff on shop.products
  for select using (shop.app_manages_merchant(merchant_id) or shop.app_is_staff());
create policy products_insert_merchant on shop.products
  for insert with check (publisher_type = 'merchant' and shop.app_manages_merchant(merchant_id));
create policy products_update_owner_or_reviewer on shop.products
  for update using (
    shop.app_manages_merchant(merchant_id)
    or shop.app_has_role('product_reviewer') or shop.app_has_role('platform_operator')
    or shop.app_has_role('admin') or shop.app_is_super_admin()
  );

alter table shop.product_variants enable row level security;
create policy product_variants_public_read on shop.product_variants
  for select using (
    deleted_at is null and exists (
      select 1 from shop.products p where p.id = product_id and p.status = 'published' and p.deleted_at is null
    )
  );
create policy product_variants_manage_owner on shop.product_variants
  for all using (
    exists (select 1 from shop.products p where p.id = product_id and shop.app_manages_merchant(p.merchant_id))
    or shop.app_is_staff()
  );

alter table shop.product_media enable row level security;
create policy product_media_public_read on shop.product_media
  for select using (
    deleted_at is null and exists (
      select 1 from shop.products p where p.id = product_id and p.status = 'published' and p.deleted_at is null
    )
  );
create policy product_media_manage_owner on shop.product_media
  for all using (
    exists (select 1 from shop.products p where p.id = product_id and shop.app_manages_merchant(p.merchant_id))
    or shop.app_is_staff()
  );

alter table shop.product_tag_relations enable row level security;
create policy product_tag_relations_public_read on shop.product_tag_relations for select using (true);
create policy product_tag_relations_manage_owner on shop.product_tag_relations
  for all using (
    exists (select 1 from shop.products p where p.id = product_id and shop.app_manages_merchant(p.merchant_id))
    or shop.app_is_staff()
  );

alter table shop.inventories enable row level security;
create policy inventories_select on shop.inventories
  for select using (
    exists (
      select 1 from shop.products p
      where p.id = product_id
        and (p.status = 'published' or shop.app_manages_merchant(p.merchant_id) or shop.app_is_staff())
    )
  );
create policy inventories_manage_owner on shop.inventories
  for all using (
    exists (select 1 from shop.products p where p.id = product_id and shop.app_manages_merchant(p.merchant_id))
    or shop.app_is_staff()
  );

-- ----------------------------------------------------------------------------
-- 购物车 / 意向清单 / 询价 / 代购需求（0005）：均为用户自有数据 + 对应商家/客服可见
-- ----------------------------------------------------------------------------

alter table shop.carts enable row level security;
create policy carts_owner_full_access on shop.carts
  for all using (user_id = shop.app_current_profile_id()) with check (user_id = shop.app_current_profile_id());

alter table shop.cart_items enable row level security;
create policy cart_items_owner_full_access on shop.cart_items
  for all using (exists (select 1 from shop.carts c where c.id = cart_id and c.user_id = shop.app_current_profile_id()))
  with check (exists (select 1 from shop.carts c where c.id = cart_id and c.user_id = shop.app_current_profile_id()));

alter table shop.wishlists enable row level security;
create policy wishlists_owner_full_access on shop.wishlists
  for all using (user_id = shop.app_current_profile_id()) with check (user_id = shop.app_current_profile_id());

alter table shop.wishlist_items enable row level security;
create policy wishlist_items_owner_full_access on shop.wishlist_items
  for all using (
    exists (select 1 from shop.wishlists w where w.id = wishlist_id and w.user_id = shop.app_current_profile_id())
  )
  with check (
    exists (select 1 from shop.wishlists w where w.id = wishlist_id and w.user_id = shop.app_current_profile_id())
  );

alter table shop.inquiries enable row level security;
create policy inquiries_select_participant on shop.inquiries
  for select using (
    user_id = shop.app_current_profile_id() or shop.app_manages_merchant(merchant_id) or shop.app_is_staff()
  );
create policy inquiries_insert_owner on shop.inquiries
  for insert with check (user_id = shop.app_current_profile_id());
create policy inquiries_update_participant on shop.inquiries
  for update using (
    user_id = shop.app_current_profile_id() or shop.app_manages_merchant(merchant_id) or shop.app_is_staff()
  );

alter table shop.inquiry_messages enable row level security;
create policy inquiry_messages_select_participant on shop.inquiry_messages
  for select using (
    exists (
      select 1 from shop.inquiries i
      where i.id = inquiry_id
        and (i.user_id = shop.app_current_profile_id() or shop.app_manages_merchant(i.merchant_id) or shop.app_is_staff())
    )
  );
create policy inquiry_messages_insert_participant on shop.inquiry_messages
  for insert with check (
    sender_id = shop.app_current_profile_id() and exists (
      select 1 from shop.inquiries i
      where i.id = inquiry_id
        and (i.user_id = shop.app_current_profile_id() or shop.app_manages_merchant(i.merchant_id))
    )
  );

alter table shop.merchant_quotes enable row level security;
create policy merchant_quotes_select_participant on shop.merchant_quotes
  for select using (
    shop.app_manages_merchant(merchant_id) or shop.app_is_staff() or exists (
      select 1 from shop.inquiries i where i.id = inquiry_id and i.user_id = shop.app_current_profile_id()
    )
  );
create policy merchant_quotes_manage_merchant on shop.merchant_quotes
  for all using (shop.app_manages_merchant(merchant_id)) with check (shop.app_manages_merchant(merchant_id));

alter table shop.custom_purchase_requests enable row level security;
create policy custom_purchase_requests_owner_select on shop.custom_purchase_requests
  for select using (user_id = shop.app_current_profile_id() or shop.app_is_staff());
create policy custom_purchase_requests_visible_to_merchants on shop.custom_purchase_requests
  for select using (
    status = 'open' and (
      visibility = 'all_verified_merchants'
      or (visibility = 'specific_merchants' and exists (
        select 1 from shop.merchant_members mm
        where mm.user_id = shop.app_current_profile_id() and mm.merchant_id = any (visible_merchant_ids)
      ))
    )
  );
create policy custom_purchase_requests_owner_insert on shop.custom_purchase_requests
  for insert with check (user_id = shop.app_current_profile_id());
create policy custom_purchase_requests_owner_update on shop.custom_purchase_requests
  for update using (user_id = shop.app_current_profile_id() or shop.app_is_staff());

-- ----------------------------------------------------------------------------
-- 订单与履约（0006）
-- ----------------------------------------------------------------------------

alter table shop.orders enable row level security;
create policy orders_select_participant on shop.orders
  for select using (
    user_id = shop.app_current_profile_id() or shop.app_manages_merchant(merchant_id) or shop.app_is_staff()
  );
create policy orders_insert_owner on shop.orders
  for insert with check (user_id = shop.app_current_profile_id());
create policy orders_update_participant on shop.orders
  for update using (
    user_id = shop.app_current_profile_id() or shop.app_manages_merchant(merchant_id) or shop.app_is_staff()
  );

alter table shop.order_items enable row level security;
create policy order_items_select_participant on shop.order_items
  for select using (
    exists (
      select 1 from shop.orders o
      where o.id = order_id
        and (o.user_id = shop.app_current_profile_id() or shop.app_manages_merchant(o.merchant_id) or shop.app_is_staff())
    )
  );

alter table shop.order_status_history enable row level security;
create policy order_status_history_select_participant on shop.order_status_history
  for select using (
    exists (
      select 1 from shop.orders o
      where o.id = order_id
        and (o.user_id = shop.app_current_profile_id() or shop.app_manages_merchant(o.merchant_id) or shop.app_is_staff())
    )
  );
create policy order_status_history_insert_staff on shop.order_status_history
  for insert with check (
    exists (select 1 from shop.orders o where o.id = order_id and shop.app_manages_merchant(o.merchant_id))
    or shop.app_is_staff()
  );

alter table shop.purchase_progress enable row level security;
create policy purchase_progress_select_participant on shop.purchase_progress
  for select using (
    exists (
      select 1 from shop.orders o
      where o.id = order_id
        and (o.user_id = shop.app_current_profile_id() or shop.app_manages_merchant(o.merchant_id) or shop.app_is_staff())
    )
  );
create policy purchase_progress_insert_owner_merchant on shop.purchase_progress
  for insert with check (
    exists (select 1 from shop.orders o where o.id = order_id and shop.app_manages_merchant(o.merchant_id))
    or shop.app_is_staff()
  );

alter table shop.group_buys enable row level security;
create policy group_buys_public_read on shop.group_buys for select using (deleted_at is null);
create policy group_buys_manage_merchant on shop.group_buys
  for all using (shop.app_manages_merchant(merchant_id) or shop.app_is_staff())
  with check (shop.app_manages_merchant(merchant_id) or shop.app_is_staff());

alter table shop.group_buy_members enable row level security;
create policy group_buy_members_select on shop.group_buy_members
  for select using (
    user_id = shop.app_current_profile_id()
    or exists (select 1 from shop.group_buys g where g.id = group_buy_id and shop.app_manages_merchant(g.merchant_id))
    or shop.app_is_staff()
  );
create policy group_buy_members_insert_owner on shop.group_buy_members
  for insert with check (user_id = shop.app_current_profile_id());

alter table shop.preorders enable row level security;
create policy preorders_select_participant on shop.preorders
  for select using (
    user_id = shop.app_current_profile_id() or shop.app_manages_merchant(merchant_id) or shop.app_is_staff()
  );
create policy preorders_insert_owner on shop.preorders
  for insert with check (user_id = shop.app_current_profile_id());
create policy preorders_update_participant on shop.preorders
  for update using (user_id = shop.app_current_profile_id() or shop.app_manages_merchant(merchant_id) or shop.app_is_staff());

-- ----------------------------------------------------------------------------
-- 汇率与支付预留（0007）：payment_enabled 恒为 false 期间，支付相关表默认仅管理员可读
-- ----------------------------------------------------------------------------

alter table shop.exchange_rates enable row level security;
create policy exchange_rates_public_read on shop.exchange_rates for select using (is_active = true);
create policy exchange_rates_manage_admin on shop.exchange_rates
  for all using (shop.app_has_role('admin') or shop.app_is_super_admin())
  with check (shop.app_has_role('admin') or shop.app_is_super_admin());

alter table shop.price_snapshots enable row level security;
create policy price_snapshots_select_staff on shop.price_snapshots for select using (shop.app_is_staff());

alter table shop.payments enable row level security;
create policy payments_select_owner_or_staff on shop.payments
  for select using (
    exists (select 1 from shop.orders o where o.id = order_id and o.user_id = shop.app_current_profile_id())
    or shop.app_is_staff()
  );
-- 第一期 payment_enabled = false，不开放任何角色的写入策略，写入需求留待支付网关正式接入时补充。

alter table shop.payment_transactions enable row level security;
create policy payment_transactions_select_staff on shop.payment_transactions for select using (shop.app_is_staff());

alter table shop.refunds enable row level security;
create policy refunds_select_owner_or_staff on shop.refunds
  for select using (
    exists (select 1 from shop.orders o where o.id = order_id and o.user_id = shop.app_current_profile_id())
    or shop.app_is_staff()
  );

-- ----------------------------------------------------------------------------
-- 内容与专题（0008）：published/visible 内容公开只读，写入仅限内容编辑与管理员
-- ----------------------------------------------------------------------------

alter table shop.content_pages enable row level security;
create policy content_pages_public_read on shop.content_pages for select using (status = 'published');
create policy content_pages_manage_editor on shop.content_pages
  for all using (shop.app_has_role('content_editor') or shop.app_has_role('admin') or shop.app_is_super_admin())
  with check (shop.app_has_role('content_editor') or shop.app_has_role('admin') or shop.app_is_super_admin());

alter table shop.editorial_collections enable row level security;
create policy editorial_collections_public_read on shop.editorial_collections for select using (status = 'published');
create policy editorial_collections_manage_editor on shop.editorial_collections
  for all using (shop.app_has_role('content_editor') or shop.app_has_role('admin') or shop.app_is_super_admin())
  with check (shop.app_has_role('content_editor') or shop.app_has_role('admin') or shop.app_is_super_admin());

alter table shop.editorial_collection_items enable row level security;
create policy editorial_collection_items_public_read on shop.editorial_collection_items
  for select using (
    exists (select 1 from shop.editorial_collections c where c.id = collection_id and c.status = 'published')
  );
create policy editorial_collection_items_manage_editor on shop.editorial_collection_items
  for all using (shop.app_has_role('content_editor') or shop.app_has_role('admin') or shop.app_is_super_admin())
  with check (shop.app_has_role('content_editor') or shop.app_has_role('admin') or shop.app_is_super_admin());

alter table shop.city_guides enable row level security;
create policy city_guides_public_read on shop.city_guides for select using (is_visible = true);
create policy city_guides_manage_editor on shop.city_guides
  for all using (shop.app_has_role('content_editor') or shop.app_has_role('admin') or shop.app_is_super_admin())
  with check (shop.app_has_role('content_editor') or shop.app_has_role('admin') or shop.app_is_super_admin());

alter table shop.faqs enable row level security;
create policy faqs_public_read on shop.faqs for select using (is_visible = true);
create policy faqs_manage_editor on shop.faqs
  for all using (shop.app_has_role('content_editor') or shop.app_has_role('admin') or shop.app_is_super_admin())
  with check (shop.app_has_role('content_editor') or shop.app_has_role('admin') or shop.app_is_super_admin());

alter table shop.legal_documents enable row level security;
create policy legal_documents_public_read on shop.legal_documents for select using (true);
create policy legal_documents_manage_admin on shop.legal_documents
  for all using (shop.app_has_role('admin') or shop.app_is_super_admin())
  with check (shop.app_has_role('admin') or shop.app_is_super_admin());

-- ----------------------------------------------------------------------------
-- 评价、举报、通知、合规与系统设置（0009）
-- ----------------------------------------------------------------------------

alter table shop.product_reviews enable row level security;
create policy product_reviews_public_read on shop.product_reviews
  for select using (is_hidden = false and deleted_at is null);
create policy product_reviews_owner_select on shop.product_reviews
  for select using (user_id = shop.app_current_profile_id() or shop.app_is_staff());
create policy product_reviews_owner_insert on shop.product_reviews
  for insert with check (user_id = shop.app_current_profile_id());
create policy product_reviews_moderate_staff on shop.product_reviews
  for update using (shop.app_has_role('customer_service') or shop.app_has_role('admin') or shop.app_is_super_admin());

alter table shop.merchant_reviews enable row level security;
create policy merchant_reviews_public_read on shop.merchant_reviews
  for select using (is_hidden = false and deleted_at is null);
create policy merchant_reviews_owner_select on shop.merchant_reviews
  for select using (user_id = shop.app_current_profile_id() or shop.app_is_staff());
create policy merchant_reviews_owner_insert on shop.merchant_reviews
  for insert with check (user_id = shop.app_current_profile_id());
create policy merchant_reviews_moderate_staff on shop.merchant_reviews
  for update using (shop.app_has_role('customer_service') or shop.app_has_role('admin') or shop.app_is_super_admin());

alter table shop.reports enable row level security;
create policy reports_select_reporter_or_staff on shop.reports
  for select using (reporter_id = shop.app_current_profile_id() or shop.app_is_staff());
create policy reports_insert_authenticated on shop.reports
  for insert with check (reporter_id = shop.app_current_profile_id());
create policy reports_moderate_staff on shop.reports
  for update using (shop.app_has_role('customer_service') or shop.app_has_role('admin') or shop.app_is_super_admin());

alter table shop.notifications enable row level security;
create policy notifications_owner_full_access on shop.notifications
  for all using (user_id = shop.app_current_profile_id()) with check (user_id = shop.app_current_profile_id());
create policy notifications_select_staff on shop.notifications for select using (shop.app_is_staff());

alter table shop.age_confirmations enable row level security;
create policy age_confirmations_owner_select on shop.age_confirmations
  for select using (user_id = shop.app_current_profile_id() or shop.app_is_staff());
create policy age_confirmations_owner_insert on shop.age_confirmations
  for insert with check (user_id = shop.app_current_profile_id() or user_id is null);
-- 游客场景（user_id 为 null，改用 session_id）第一期仍以本地存储为主，
-- 见 src/components/shared/AgeConfirmationGate.tsx；接入真实持久化时需补充 session_id 归属校验。

alter table shop.audit_logs enable row level security;
create policy audit_logs_select_staff on shop.audit_logs for select using (shop.app_is_staff());
create policy audit_logs_insert_staff on shop.audit_logs for insert with check (shop.app_is_staff());
-- shop.audit_logs 只增不改不删，故不提供 update/delete 策略。

alter table shop.system_settings enable row level security;
create policy system_settings_select_staff on shop.system_settings for select using (shop.app_is_staff());
create policy system_settings_manage_admin on shop.system_settings
  for all using (shop.app_has_role('admin') or shop.app_is_super_admin())
  with check (shop.app_has_role('admin') or shop.app_is_super_admin());
