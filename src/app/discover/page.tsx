import Link from "next/link";
import type { Metadata } from "next";
import type { Product, ProductTagKey } from "@/types";
import { PageContainer, Grid, EmptyState } from "@/components/shared";
import { ProductCard, ProductListRow, MobileFilterDrawer } from "@/components/product";
import {
  brandRepository,
  categoryRepository,
  merchantRepository,
  productRepository,
} from "@/lib/repositories";

export const metadata: Metadata = {
  title: "商品发现",
  description: "按分类、品牌、商家、城市与交易方式筛选意大利小众商品与代购资源。",
  alternates: { canonical: "/discover" },
};

const SORT_OPTIONS = [
  { value: "featured", label: "综合推荐" },
  { value: "newest", label: "最新发布" },
  { value: "price_asc", label: "价格从低到高" },
  { value: "price_desc", label: "价格从高到低" },
  { value: "popular", label: "收藏最多" },
  { value: "arriving_soon", label: "即将到货" },
] as const;

const TAG_OPTIONS: { value: ProductTagKey; label: string }[] = [
  { value: "italy_in_stock", label: "意大利现货" },
  { value: "domestic_in_stock", label: "国内现货" },
  { value: "preorder", label: "预订" },
  { value: "daigou", label: "代购" },
  { value: "group_buy", label: "拼单" },
  { value: "inquiry_only", label: "询价" },
  { value: "limited", label: "限量" },
  { value: "exclusive", label: "独家" },
  { value: "arriving_soon", label: "即将到货" },
];

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function buildQueryString(
  current: SearchParams,
  overrides: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    const v = firstValue(value);
    if (v) params.set(key, v);
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function resolveEurPrice(product: Product): number | null {
  return (
    product.pricing.eurReferencePrice ??
    (product.pricing.originalCurrency === "EUR" ? product.pricing.originalPrice : null)
  );
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = firstValue(params.q)?.trim().toLowerCase();
  const categorySlug = firstValue(params.category);
  const brandSlug = firstValue(params.brand);
  const merchantSlug = firstValue(params.merchant);
  const city = firstValue(params.city);
  const tag = firstValue(params.tag) as ProductTagKey | undefined;
  const priceMin = firstValue(params.price_min) ? Number(params.price_min) : undefined;
  const priceMax = firstValue(params.price_max) ? Number(params.price_max) : undefined;
  const sort = firstValue(params.sort) ?? "featured";
  const view = firstValue(params.view) === "list" ? "list" : "grid";

  const [productsRes, categoriesRes, brandsRes, merchantsRes] = await Promise.all([
    productRepository.findPublished(),
    categoryRepository.findVisible(),
    brandRepository.findAll(),
    merchantRepository.findActive(),
  ]);

  const categories = categoriesRes.ok ? categoriesRes.data : [];
  const brands = brandsRes.ok ? brandsRes.data : [];
  const merchants = merchantsRes.ok ? merchantsRes.data : [];

  const category = categories.find((c) => c.slug === categorySlug);
  const brand = brands.find((b) => b.slug === brandSlug);
  const merchant = merchants.find((m) => m.slug === merchantSlug);

  let products = productsRes.ok ? productsRes.data : [];

  const productTagMap = new Map<string, ProductTagKey[]>();
  await Promise.all(
    products.map(async (product) => {
      const tagsResult = await productRepository.getTagKeys(product.id);
      productTagMap.set(product.id, tagsResult.ok ? tagsResult.data : []);
    }),
  );

  if (q) {
    products = products.filter((p) => p.name["zh-CN"].toLowerCase().includes(q));
  }
  if (category) {
    products = products.filter((p) => p.categoryId === category.id);
  }
  if (brand) {
    products = products.filter((p) => p.brandId === brand.id);
  }
  if (merchant) {
    products = products.filter((p) => p.merchantId === merchant.id);
  }
  if (city) {
    products = products.filter((p) => p.sourceCity?.toLowerCase() === city.toLowerCase());
  }
  if (tag) {
    products = products.filter((p) => productTagMap.get(p.id)?.includes(tag));
  }
  if (priceMin !== undefined) {
    products = products.filter((p) => {
      const price = resolveEurPrice(p);
      return price !== null && price >= priceMin;
    });
  }
  if (priceMax !== undefined) {
    products = products.filter((p) => {
      const price = resolveEurPrice(p);
      return price !== null && price <= priceMax;
    });
  }

  const sorted = [...products].sort((a, b) => {
    switch (sort) {
      case "newest":
        return (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
      case "price_asc":
        return (resolveEurPrice(a) ?? Infinity) - (resolveEurPrice(b) ?? Infinity);
      case "price_desc":
        return (resolveEurPrice(b) ?? -Infinity) - (resolveEurPrice(a) ?? -Infinity);
      case "popular":
        return b.favoriteCount - a.favoriteCount;
      case "arriving_soon":
        return (a.estimatedArrivalAt ?? "9999").localeCompare(b.estimatedArrivalAt ?? "9999");
      default:
        return Number(b.isFeatured) - Number(a.isFeatured) || b.favoriteCount - a.favoriteCount;
    }
  });

  const hasActiveFilters = Boolean(
    q || category || brand || merchant || city || tag || priceMin || priceMax,
  );

  const filterFields = (
    <div className="flex flex-col gap-5">
      <div>
        <label htmlFor="q" className="text-ink text-sm font-medium">
          搜索
        </label>
        <input
          id="q"
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="商品名称"
          className="focus-ring border-line-strong bg-surface text-ink mt-1.5 h-10 w-full rounded-sm border px-3 text-sm"
        />
      </div>

      <div>
        <label htmlFor="category" className="text-ink text-sm font-medium">
          分类
        </label>
        <select
          id="category"
          name="category"
          defaultValue={categorySlug ?? ""}
          className="focus-ring border-line-strong bg-surface text-ink mt-1.5 h-10 w-full rounded-sm border px-3 text-sm"
        >
          <option value="">全部分类</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name["zh-CN"]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="brand" className="text-ink text-sm font-medium">
          品牌
        </label>
        <select
          id="brand"
          name="brand"
          defaultValue={brandSlug ?? ""}
          className="focus-ring border-line-strong bg-surface text-ink mt-1.5 h-10 w-full rounded-sm border px-3 text-sm"
        >
          <option value="">全部品牌</option>
          {brands.map((b) => (
            <option key={b.id} value={b.slug}>
              {b.name["zh-CN"]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="merchant" className="text-ink text-sm font-medium">
          商家
        </label>
        <select
          id="merchant"
          name="merchant"
          defaultValue={merchantSlug ?? ""}
          className="focus-ring border-line-strong bg-surface text-ink mt-1.5 h-10 w-full rounded-sm border px-3 text-sm"
        >
          <option value="">全部商家</option>
          {merchants.map((m) => (
            <option key={m.id} value={m.slug}>
              {m.name["zh-CN"]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="tag" className="text-ink text-sm font-medium">
          交易方式 / 状态
        </label>
        <select
          id="tag"
          name="tag"
          defaultValue={tag ?? ""}
          className="focus-ring border-line-strong bg-surface text-ink mt-1.5 h-10 w-full rounded-sm border px-3 text-sm"
        >
          <option value="">全部</option>
          {TAG_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="text-ink text-sm font-medium">价格区间（欧元）</span>
        <div className="mt-1.5 flex items-center gap-2">
          <input
            type="number"
            name="price_min"
            min={0}
            defaultValue={priceMin ?? ""}
            placeholder="最低"
            className="focus-ring border-line-strong bg-surface text-ink h-10 w-full rounded-sm border px-3 text-sm"
          />
          <span className="text-ink-faint">–</span>
          <input
            type="number"
            name="price_max"
            min={0}
            defaultValue={priceMax ?? ""}
            placeholder="最高"
            className="focus-ring border-line-strong bg-surface text-ink h-10 w-full rounded-sm border px-3 text-sm"
          />
        </div>
      </div>

      <input type="hidden" name="sort" value={sort} />
      <input type="hidden" name="view" value={view} />

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          className="focus-ring bg-brand-700 hover:bg-brand-900 h-10 rounded-sm text-sm font-medium text-white"
        >
          应用筛选
        </button>
        {hasActiveFilters && (
          <Link
            href="/discover"
            className="focus-ring text-ink-muted text-center text-sm underline"
          >
            清除全部筛选
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <PageContainer className="flex flex-col gap-6 py-10">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">商品发现</h1>
        <p className="text-ink-muted mt-1 text-sm">共 {sorted.length} 件商品</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <form action="/discover" method="get">
            {filterFields}
          </form>
        </aside>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <form action="/discover" method="get">
              {Object.entries(params).map(([key, value]) => {
                if (key === "sort" || key === "view") return null;
                const v = firstValue(value);
                return v ? <input key={key} type="hidden" name={key} value={v} /> : null;
              })}
              <input type="hidden" name="view" value={view} />
              <label htmlFor="sort" className="sr-only">
                排序
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={sort}
                className="focus-ring border-line-strong bg-surface text-ink h-9 rounded-sm border px-2 text-sm"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </form>

            <div className="flex items-center gap-2">
              <Link
                href={buildQueryString(params, { view: "grid" })}
                className={`focus-ring rounded-xs border px-3 py-1.5 text-xs ${view === "grid" ? "border-brand-700 text-brand-700" : "border-line text-ink-muted"}`}
              >
                网格
              </Link>
              <Link
                href={buildQueryString(params, { view: "list" })}
                className={`focus-ring rounded-xs border px-3 py-1.5 text-xs ${view === "list" ? "border-brand-700 text-brand-700" : "border-line text-ink-muted"}`}
              >
                列表
              </Link>
            </div>
          </div>

          <MobileFilterDrawer resultCount={sorted.length}>
            <form action="/discover" method="get">
              {filterFields}
            </form>
          </MobileFilterDrawer>

          {sorted.length === 0 ? (
            <EmptyState
              title="没有找到符合条件的商品"
              description="试试调整筛选条件，或清除全部筛选重新浏览。"
              action={
                <Link href="/discover" className="focus-ring text-brand-700 text-sm underline">
                  清除全部筛选
                </Link>
              }
            />
          ) : view === "grid" ? (
            <Grid columns="4">
              {sorted.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  tags={productTagMap.get(product.id) ?? []}
                  brandName={brands.find((b) => b.id === product.brandId)?.name["zh-CN"]}
                />
              ))}
            </Grid>
          ) : (
            <div className="flex flex-col gap-3">
              {sorted.map((product) => (
                <ProductListRow
                  key={product.id}
                  product={product}
                  tags={productTagMap.get(product.id) ?? []}
                  brandName={brands.find((b) => b.id === product.brandId)?.name["zh-CN"]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
