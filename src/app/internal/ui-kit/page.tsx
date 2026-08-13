"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Drawer } from "@/components/ui/Drawer";
import { PageContainer } from "@/components/shared/PageContainer";
import { Grid } from "@/components/shared/Grid";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { ProductCardSkeleton } from "@/components/shared/Skeleton";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductTagBadge } from "@/components/product/ProductTagBadge";
import { BrandCard } from "@/components/brand/BrandCard";
import { MerchantCard } from "@/components/merchant/MerchantCard";
import { mockBrands, mockMerchants, mockProducts, mockProductTagRelations } from "@/data/mock";

const COLOR_SWATCHES: { token: string; className: string }[] = [
  { token: "paper", className: "bg-paper" },
  { token: "surface", className: "bg-surface border border-line" },
  { token: "surface-muted", className: "bg-surface-muted" },
  { token: "line", className: "bg-line" },
  { token: "line-strong", className: "bg-line-strong" },
  { token: "ink", className: "bg-ink" },
  { token: "ink-muted", className: "bg-ink-muted" },
  { token: "ink-faint", className: "bg-ink-faint" },
  { token: "brand-50", className: "bg-brand-50" },
  { token: "brand-100", className: "bg-brand-100" },
  { token: "brand-700", className: "bg-brand-700" },
  { token: "brand-900", className: "bg-brand-900" },
  { token: "success-700", className: "bg-success-700" },
  { token: "warning-900", className: "bg-warning-900" },
  { token: "danger-900", className: "bg-danger-900" },
];

const BADGE_TONES: BadgeTone[] = [
  "neutral",
  "accent",
  "emphasis",
  "muted",
  "success",
  "warning",
  "danger",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-line flex flex-col gap-4 border-t py-10 first:border-t-0 first:pt-0">
      <h2 className="text-ink font-serif text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function UiKitPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inputError, setInputError] = useState(false);

  const demoProducts = mockProducts.filter((p) => p.status === "published").slice(0, 4);
  const demoBrands = mockBrands.slice(0, 4);
  const demoMerchants = mockMerchants.slice(0, 3);

  return (
    <PageContainer className="py-12">
      <header className="mb-4">
        <p className="text-ink-faint text-xs tracking-[0.2em] uppercase">
          Internal / Design System
        </p>
        <h1 className="text-ink mt-2 font-serif text-3xl font-semibold">内部 UI 组件展示页</h1>
        <p className="text-ink-muted mt-2 max-w-2xl text-sm">
          仅供开发阶段内部核对设计系统一致性使用，不作为正式页面对外发布。
        </p>
      </header>

      <Section title="色彩">
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
          {COLOR_SWATCHES.map((swatch) => (
            <div key={swatch.token} className="flex flex-col gap-2">
              <div className={`h-16 rounded-sm ${swatch.className}`} />
              <span className="text-ink-muted text-xs">{swatch.token}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="字体">
        <div className="flex flex-col gap-3">
          <p className="text-ink font-serif text-3xl font-semibold">
            Expectaly Shop 意料之中～意购
          </p>
          <p className="text-ink text-base">
            正文中文使用系统无衬线字体栈，保证跨平台渲染速度与一致性。
          </p>
          <p className="text-ink-muted text-sm">次要文字 / 说明性文字 Secondary text</p>
        </div>
      </Section>

      <Section title="按钮">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">主要按钮</Button>
          <Button variant="secondary">次要按钮</Button>
          <Button variant="ghost">文字按钮</Button>
          <Button variant="danger">危险操作</Button>
          <Button variant="primary" isLoading>
            提交中
          </Button>
          <Button variant="primary" disabled>
            已禁用
          </Button>
          <Button variant="secondary" size="sm">
            小尺寸
          </Button>
          <Button variant="secondary" size="lg">
            大尺寸
          </Button>
        </div>
      </Section>

      <Section title="表单控件">
        <div className="grid max-w-xl gap-4">
          <Input label="收货人姓名" placeholder="请输入姓名" required />
          <Input
            label="联系电话"
            placeholder="请输入手机号"
            error={inputError ? "请输入正确的手机号格式" : undefined}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setInputError((v) => !v)}
            className="w-fit"
          >
            切换错误状态演示
          </Button>
          <Select
            label="收货城市"
            placeholder="请选择城市"
            options={[
              { value: "milano", label: "米兰 Milano" },
              { value: "firenze", label: "佛罗伦萨 Firenze" },
              { value: "roma", label: "罗马 Roma" },
            ]}
          />
          <Textarea
            label="留言"
            description="向商家说明规格、数量或其他需求"
            placeholder="请输入留言内容"
          />
        </div>
      </Section>

      <Section title="标签 / 状态徽章">
        <div className="flex flex-wrap gap-2">
          {BADGE_TONES.map((tone) => (
            <Badge key={tone} tone={tone}>
              {tone}
            </Badge>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {Array.from(new Set(mockProductTagRelations.map((r) => r.tagKey))).map((tagKey) => (
            <ProductTagBadge key={tagKey} tagKey={tagKey} />
          ))}
        </div>
      </Section>

      <Section title="弹层 / 抽屉">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setDialogOpen(true)}>
            打开对话框
          </Button>
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
            打开抽屉面板
          </Button>
        </div>
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="确认操作"
          description="这是一个基于原生 dialog 元素的示例对话框，支持 Esc 关闭与焦点锁定。"
        >
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={() => setDialogOpen(false)}>
              确认
            </Button>
          </div>
        </Dialog>
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="筛选" side="right">
          <p className="text-ink-muted text-sm">抽屉面板示例内容，可用于移动端筛选或菜单场景。</p>
        </Drawer>
      </Section>

      <Section title="图片占位">
        <div className="grid max-w-xl grid-cols-3 gap-4">
          <PlaceholderImage label="正方形" aspect="square" className="rounded-xs" />
          <PlaceholderImage label="纵向" aspect="portrait" className="rounded-xs" />
          <PlaceholderImage label="横向" aspect="landscape" className="rounded-xs" />
        </div>
      </Section>

      <Section title="商品卡片">
        <Grid columns="4">
          {demoProducts.map((product) => {
            const tags = mockProductTagRelations
              .filter((r) => r.productId === product.id)
              .map((r) => r.tagKey);
            return (
              <ProductCard
                key={product.id}
                product={product}
                tags={tags}
                brandName={mockBrands.find((b) => b.id === product.brandId)?.name["zh-CN"]}
              />
            );
          })}
        </Grid>
      </Section>

      <Section title="商品卡片骨架屏（加载态）">
        <Grid columns="4">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </Grid>
      </Section>

      <Section title="品牌卡片">
        <Grid columns="4">
          {demoBrands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </Grid>
      </Section>

      <Section title="商家卡片">
        <div className="flex flex-col gap-3">
          {demoMerchants.map((merchant) => (
            <MerchantCard key={merchant.id} merchant={merchant} />
          ))}
        </div>
      </Section>

      <Section title="空状态 / 错误状态">
        <div className="grid gap-6 sm:grid-cols-2">
          <EmptyState title="暂无符合条件的商品" description="试试调整筛选条件，或浏览其他分类。" />
          <ErrorState onRetry={() => undefined} />
        </div>
      </Section>
    </PageContainer>
  );
}
