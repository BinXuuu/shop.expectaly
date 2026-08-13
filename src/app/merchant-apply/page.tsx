import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { MerchantApplicationForm } from "@/components/merchant-apply/MerchantApplicationForm";
import {
  categoryRepository,
  contentPageRepository,
  merchantApplicationRepository,
} from "@/lib/repositories";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  getMerchantApplicationStatusLabel,
  getMerchantApplicationStatusTone,
} from "@/lib/services/merchant-application-view";

export async function generateMetadata(): Promise<Metadata> {
  const result = await contentPageRepository.findBySlug("merchant-apply-intro");
  return {
    title: result.ok && result.data ? result.data.title["zh-CN"] : "商家入驻",
    description: result.ok ? (result.data?.seoDescription ?? undefined) : undefined,
    alternates: { canonical: "/merchant-apply" },
  };
}

const REQUIREMENTS = [
  "个人买手或企业均可申请，需提供身份或企业资质材料",
  "具备意大利本地采购能力或稳定的货源渠道",
  "可提供采购凭证、验货视频等正品保障说明",
  "遵守平台商品发布规范与受限制商品政策",
];

const BENEFITS = [
  "触达对意大利小众品牌与代购感兴趣的用户群体",
  "站内询价、代购需求匹配与店铺内容展示工具",
  "认证徽章体系（个人/企业/本地认证）建立信任",
  "第一期不强制平台抽成，资源整合与流量撮合为主",
];

export default async function MerchantApplyPage() {
  const result = await contentPageRepository.findBySlug("merchant-apply-intro");
  if (!result.ok || !result.data) {
    notFound();
  }
  const page = result.data;

  const profile = await getCurrentProfile();

  const categoriesResult = await categoryRepository.findVisible();
  const categoryOptions = (categoriesResult.ok ? categoriesResult.data : []).map((c) => ({
    value: c.slug,
    label: c.name["zh-CN"],
  }));

  const applicationsResult = profile
    ? await merchantApplicationRepository.findByApplicant(profile.id)
    : null;
  const existingApplication =
    applicationsResult?.ok && applicationsResult.data.length > 0
      ? applicationsResult.data[0]
      : null;

  return (
    <PageContainer className="max-w-3xl py-12">
      <h1 className="text-ink font-serif text-3xl font-semibold">{page.title["zh-CN"]}</h1>
      <p className="text-ink-muted mt-6 text-base leading-8">{page.body["zh-CN"]}</p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-ink text-sm font-semibold">入驻要求</h2>
          <ul className="text-ink-muted mt-3 flex flex-col gap-2 text-sm">
            {REQUIREMENTS.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-ink text-sm font-semibold">入驻权益</h2>
          <ul className="text-ink-muted mt-3 flex flex-col gap-2 text-sm">
            {BENEFITS.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-line mt-10 border-t pt-10">
        {!profile ? (
          <div className="border-line bg-surface-muted rounded-xs border p-6">
            <p className="text-ink-muted text-sm">登录后即可在线提交入驻申请。</p>
            <Link
              href="/auth/login?redirect=/merchant-apply"
              className={buttonClasses("primary", "md", "mt-4")}
            >
              登录后申请
            </Link>
          </div>
        ) : existingApplication ? (
          <div className="border-line flex flex-col gap-3 rounded-xs border p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-ink text-sm font-semibold">你的入驻申请</h2>
              <Badge tone={getMerchantApplicationStatusTone(existingApplication.status)}>
                {getMerchantApplicationStatusLabel(existingApplication.status)}
              </Badge>
            </div>
            <p className="text-ink-muted text-sm">主体名称：{existingApplication.legalName}</p>
            {existingApplication.reviewNote && (
              <p className="text-ink-muted text-sm">审核意见：{existingApplication.reviewNote}</p>
            )}
            <p className="text-ink-faint text-xs">
              提交时间：{new Date(existingApplication.createdAt).toLocaleDateString("zh-CN")}
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-ink mb-6 font-serif text-xl font-semibold">在线申请入驻</h2>
            <MerchantApplicationForm categoryOptions={categoryOptions} />
          </>
        )}
      </div>
    </PageContainer>
  );
}
