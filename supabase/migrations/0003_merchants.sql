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
