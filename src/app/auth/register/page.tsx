import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/shared";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getCurrentProfile } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "注册",
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  const currentProfile = await getCurrentProfile();
  if (currentProfile) {
    redirect("/account");
  }

  return (
    <PageContainer className="max-w-md py-16">
      <h1 className="text-ink font-serif text-2xl font-semibold">注册</h1>
      <p className="text-ink-muted mt-2 text-sm">
        创建账号后即可收藏商品、发起询价与提交代购需求。
      </p>
      <div className="mt-8">
        <RegisterForm />
      </div>
      <p className="text-ink-muted mt-6 text-center text-sm">
        已有账号？
        <Link href="/auth/login" className="text-brand-700 underline">
          去登录
        </Link>
      </p>
    </PageContainer>
  );
}
