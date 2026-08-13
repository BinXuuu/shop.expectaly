import "server-only";
import type { Profile, Role } from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { ProfileRow } from "@/lib/supabase/types";

/**
 * 首次登录但意购还没有对应资料时（例如账号是在主站或意租注册的，
 * 只共享了 auth.users，没共享 profiles 表），当场自动补一条 shop.profiles
 * + 默认 user 角色，避免"密码验证通过但应用不认得你"的情况。
 * 用 service role 客户端绕过 RLS 写入，与 actions.ts 里 registerAccount() 的
 * 初始化逻辑保持一致，不为此单独放开 profiles 的 insert 策略。
 */
async function provisionProfile(
  authUserId: string,
  email: string | null,
): Promise<ProfileRow | null> {
  const admin = createAdminSupabaseClient();
  if (!admin) return null;

  const displayName = email?.split("@")[0] || "新用户";

  const { data: profileRow, error } = await admin
    .from("profiles")
    .insert({
      auth_user_id: authUserId,
      display_name: displayName,
      email,
      primary_provider: "email",
    })
    .select("*")
    .single();

  if (error || !profileRow) {
    console.error("provisionProfile", error?.message);
    return null;
  }

  const { error: roleError } = await admin
    .from("user_roles")
    .insert({ user_id: profileRow.id, role: "user" });

  if (roleError) {
    console.error("provisionProfile role", roleError.message);
  }

  return profileRow;
}

function mapRowToProfile(row: ProfileRow, roles: Role[]): Profile {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    email: row.email,
    phone: row.phone,
    primaryProvider: row.primary_provider,
    mainSiteUserId: row.main_site_user_id,
    locale: row.locale,
    roles,
    status: row.status,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  };
}

/**
 * 读取当前登录用户的 Profile；未登录、Supabase 未配置或会话失效时返回 null。
 * 真正的身份来自 Supabase Auth（auth.users，与主站/意租共用），业务侧资料存在
 * shop.profiles，通过 auth_user_id 关联；角色存在 shop.user_roles（一个用户可有多个角色）。
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: existingRow, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", auth.user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (profileError) {
    console.error("getCurrentProfile", profileError.message);
    return null;
  }

  if (!existingRow) {
    const provisioned = await provisionProfile(auth.user.id, auth.user.email ?? null);
    if (!provisioned) return null;
    return mapRowToProfile(provisioned, ["user"]);
  }

  const { data: roleRows, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", existingRow.id)
    .is("deleted_at", null);

  if (roleError) {
    console.error("getCurrentProfile roles", roleError.message);
  }

  const roles = (roleRows ?? []).map((r) => r.role);

  return mapRowToProfile(existingRow, roles.length > 0 ? roles : ["user"]);
}
