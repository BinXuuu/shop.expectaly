import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./types";
import { getSupabaseEnv } from "./env";

export async function createServerSupabaseClient() {
  const env = getSupabaseEnv();
  if (!env) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(env.url, env.anonKey, {
    db: { schema: "shop" },
    cookieOptions: { name: "sb-auth-token" },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies. Server Actions can.
        }
      },
    },
  });
}
