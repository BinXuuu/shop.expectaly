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
