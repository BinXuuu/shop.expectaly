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
