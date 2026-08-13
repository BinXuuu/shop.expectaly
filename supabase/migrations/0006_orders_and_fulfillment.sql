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
