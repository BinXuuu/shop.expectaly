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
