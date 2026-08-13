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
