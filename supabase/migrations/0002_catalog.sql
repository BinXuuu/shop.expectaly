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
