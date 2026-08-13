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
