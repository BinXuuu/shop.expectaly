import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** /internal/* 仅供开发阶段内部核对使用，禁止搜索引擎索引。 */
export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
