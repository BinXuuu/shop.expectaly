import Link from "next/link";
import type { Metadata } from "next";
import { PageContainer, Grid, PlaceholderImage } from "@/components/shared";
import { cityGuideRepository } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "城市选品",
  description: "按意大利城市浏览本地品牌、商家与精选商品。",
  alternates: { canonical: "/cities" },
};

export default async function CitiesPage() {
  const citiesResult = await cityGuideRepository.findVisible();
  const cities = citiesResult.ok ? citiesResult.data : [];

  return (
    <PageContainer className="flex flex-col gap-8 py-10">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">城市选品</h1>
        <p className="text-ink-muted mt-2 max-w-2xl text-sm">
          从米兰到摩德纳，每座城市都有独特的设计师、买手与收藏文化。
        </p>
      </div>
      <Grid columns="4">
        {cities.map((city) => (
          <Link
            key={city.id}
            href={`/cities/${city.slug}`}
            className="focus-ring group flex flex-col rounded-xs"
          >
            <div className="border-line overflow-hidden rounded-xs border">
              <PlaceholderImage label={city.cityName["zh-CN"]} aspect="landscape" />
            </div>
            <h2 className="text-ink group-hover:text-brand-700 mt-3 font-serif text-base font-semibold">
              {city.cityName["zh-CN"]}
            </h2>
            <p className="text-ink-muted mt-1 line-clamp-2 text-sm">{city.introduction["zh-CN"]}</p>
          </Link>
        ))}
      </Grid>
    </PageContainer>
  );
}
