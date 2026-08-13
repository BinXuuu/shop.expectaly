/**
 * 与 supabase/migrations/0001~0009 一一对应的表结构类型。
 * 本项目共 48 张业务表（shop schema），目前仅账号相关的 profiles/user_roles
 * 接入真实 Supabase 查询（用于登录/角色判断），其余表仍读取 src/data/mock/。
 * 后续把某张表接入真实查询时，在这里补上对应的 Row/Insert/Update 类型即可，
 * 字段增删需同步更新对应的迁移文件与本文件，两者必须保持一致。
 */

export type Database = {
  shop: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_user_id: string;
          display_name: string;
          avatar_url: string | null;
          email: string | null;
          phone: string | null;
          primary_provider: "email" | "phone" | "wechat" | "main_site_sso";
          main_site_user_id: string | null;
          locale: "zh-CN" | "it-IT" | "en-US";
          status: "active" | "suspended" | "banned";
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: Partial<Database["shop"]["Tables"]["profiles"]["Row"]> & {
          auth_user_id: string;
          display_name: string;
        };
        Update: Partial<Database["shop"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role:
            | "guest"
            | "user"
            | "merchant_applicant"
            | "merchant"
            | "platform_operator"
            | "content_editor"
            | "customer_service"
            | "product_reviewer"
            | "merchant_reviewer"
            | "admin"
            | "super_admin";
          granted_at: string;
          granted_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: Partial<Database["shop"]["Tables"]["user_roles"]["Row"]> & {
          user_id: string;
          role: Database["shop"]["Tables"]["user_roles"]["Row"]["role"];
        };
        Update: Partial<Database["shop"]["Tables"]["user_roles"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type ProfileRow = Database["shop"]["Tables"]["profiles"]["Row"];
export type UserRoleRow = Database["shop"]["Tables"]["user_roles"]["Row"];
