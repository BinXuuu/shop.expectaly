import type { Metadata } from "next";
import { EmptyState, Grid } from "@/components/shared";
import { ProductCard } from "@/components/product";
import { getCurrentProfile } from "@/lib/auth/session";
import { productRepository, wishlistRepository } from "@/lib/repositories";
import { attachProductTags } from "@/lib/services/product-view";

export const metadata: Metadata = { title: "我的收藏", robots: { index: false, follow: false } };

export default async function AccountWishlistPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const wishlistResult = await wishlistRepository.findByUser(profile.id);
  const wishlistItemsResult =
    wishlistResult.ok && wishlistResult.data
      ? await wishlistRepository.getItems(wishlistResult.data.id)
      : null;
  const wishlistItems = wishlistItemsResult?.ok ? wishlistItemsResult.data : [];

  const products = (
    await Promise.all(
      wishlistItems.map(async (item) => {
        const productResult = await productRepository.findById(item.productId);
        return productResult.ok ? productResult.data : null;
      }),
    )
  ).filter((p): p is NonNullable<typeof p> => Boolean(p));

  const productsWithTags = await attachProductTags(products);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">我的收藏</h1>
        <p className="text-ink-muted mt-1 text-sm">收藏的商品会保留在这里，方便随时回顾。</p>
      </div>

      {productsWithTags.length === 0 ? (
        <EmptyState title="暂无收藏商品" description="在商品详情页点击收藏，加入你的意向清单。" />
      ) : (
        <Grid columns="4">
          {productsWithTags.map(({ product, tags }) => (
            <ProductCard key={product.id} product={product} tags={tags} />
          ))}
        </Grid>
      )}
    </div>
  );
}
