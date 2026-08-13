"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { safeRedirectPath, type AuthActionState } from "./types";

/** 邮箱 + 密码登录，走真实 Supabase Auth（与主站、意租共用同一个项目）。 */
export async function loginWithEmail(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "");

  if (!email || !password) {
    return { error: "请输入邮箱和密码" };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { error: "登录服务未配置，请联系管理员" };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "邮箱或密码不正确" };
  }

  redirect(safeRedirectPath(redirectTo));
}

/**
 * 邮箱 + 密码注册。注册成功后使用 service role 客户端（绕过 RLS）为新用户
 * 初始化 shop.profiles 与默认角色（user），避免为此单独放开写入策略。
 * 若 Supabase 项目开启了邮箱验证，signUp 不会立即返回会话，需提示用户先完成邮箱验证。
 */
export async function registerAccount(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!displayName) {
    return { error: "请输入昵称" };
  }
  if (!email) {
    return { error: "请输入邮箱" };
  }
  if (password.length < 6) {
    return { error: "密码至少需要 6 位" };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { error: "注册服务未配置，请联系管理员" };
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return { error: error.message };
  }
  if (!data.user) {
    return { error: "注册失败，请稍后重试" };
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return { error: "账号已创建，但资料初始化服务未配置，请联系管理员" };
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .insert({
      auth_user_id: data.user.id,
      display_name: displayName,
      email,
      primary_provider: "email",
    })
    .select("id")
    .single();

  if (profileError || !profile) {
    return { error: "账号已创建，但资料初始化失败，请联系管理员" };
  }

  const { error: roleError } = await admin
    .from("user_roles")
    .insert({ user_id: profile.id, role: "user" });

  if (roleError) {
    return { error: "账号已创建，但角色初始化失败，请联系管理员" };
  }

  if (!data.session) {
    return { error: "注册成功，请前往邮箱完成验证后再登录" };
  }

  redirect("/account");
}

export async function logout() {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/");
}
