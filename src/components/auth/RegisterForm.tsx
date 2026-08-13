"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { registerAccount } from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/auth/types";

const INITIAL_STATE: AuthActionState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAccount, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input label="昵称" name="displayName" required placeholder="怎么称呼你" />
      <Input label="邮箱" name="email" type="email" required placeholder="you@example.com" />
      <Input
        label="密码"
        name="password"
        type="password"
        required
        description="至少 6 位"
        error={state.error}
      />
      <Button type="submit" variant="primary" isLoading={pending}>
        注册并登录
      </Button>
    </form>
  );
}
