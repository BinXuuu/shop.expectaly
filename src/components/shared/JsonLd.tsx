export interface JsonLdProps {
  data: Record<string, unknown>;
}

/** 结构化数据（schema.org）输出组件，转义 `<` 防止内容中出现 `</script>` 提前截断标签。 */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
