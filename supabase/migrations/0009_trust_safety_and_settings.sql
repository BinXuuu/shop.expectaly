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
