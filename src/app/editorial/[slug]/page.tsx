import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState, Grid, PageContainer, PlaceholderImage } from "@/components/shared";
import { ProductCard } from "@/components/product";
import { BrandCard } from "@/components/brand";
import { MerchantCard } from "@/components/merchant";
import { editorialCollectionRepository } from "@/lib/repositories";
import { attachProductTags } from "@/lib/services/product-view";
import { mockBrands, mockMerchants, mockProducts } from "@/data/mock";

interface EditorialPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EditorialPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await editorialCollectionRepository.findBySlug(slug);
  if (!result.ok || !result.data) {
    return { title: "专题不存在" };
  }
  return {
    title: result.data.title["zh-CN"],
    description: result.data.description?.["zh-CN"] ?? result.data.title["zh-CN"],
    alternates: { canonical: `/editorial/${slug}` },
  };
}

export default async function EditorialDetailPage({ params }: EditorialPageProps) {
  const { slug } = await params;
  const collectionResult = await editorialCollectionRepository.findBySlug(slug);

  if (!collectionResult.ok || !collectionResult.data) {
    notFound();
  }

  const collection = collectionResult.data;
  const itemsResult = await editorialCollectionRepository.getItems(collection.id);
  const items = itemsResult.ok ? itemsResult.data : [];

  const productItems = items
    .filter((i) => i.itemType === "product")
    .map((i) => mockProducts.find((p) => p.id === i.itemId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const brandItems = items
    .filter((i) => i.itemType === "brand")
    .map((i) => mockBrands.find((b) => b.id === i.itemId))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));
  const merchantItems = items
    .filter((i) => i.itemType === "merchant")
    .map((i) => mockMerchants.find((m) => m.id === i.itemId))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  const productsWithTags = await attachProductTags(productItems);

  return (
    <PageContainer className="flex flex-col gap-10 py-10">
      <div className="border-line overflow-hidden rounded-xs border">
        <PlaceholderImage label={collection.title["zh-CN"]} aspect="landscape" />
      </div>

      <div>
        <h1 className="text-ink font-serif text-3xl font-semibold">{collection.title["zh-CN"]}</h1>
        {collection.description && (
          <p className="text-ink-muted mt-3 max-w-3xl text-sm leading-7">
            {collection.description["zh-CN"]}
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState title="该专题暂无收录内容" description="敬请期待后续更新。" />
      ) : (
        <>
          {productsWithTags.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-ink font-serif text-xl font-semibold">收录商品</h2>
              <Grid columns="4">
                {productsWithTags.map(({ product, tags }) => (
                  <ProductCard key={product.id} product={product} tags={tags} />
                ))}
              </Grid>
            </section>
          )}
          {brandItems.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-ink font-serif text-xl font-semibold">收录品牌</h2>
              <Grid columns="4">
                {brandItems.map((brand) => (
                  <BrandCard key={brand.id} brand={brand} />
                ))}
              </Grid>
            </section>
          )}
          {merchantItems.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-ink font-serif text-xl font-semibold">收录商家</h2>
              <div className="flex flex-col gap-3">
                {merchantItems.map((merchant) => (
                  <MerchantCard key={merchant.id} merchant={merchant} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </PageContainer>
  );
}
