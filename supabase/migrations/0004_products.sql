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
