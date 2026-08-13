/**
 * 风险关键词自动预警：将命中平台配置的风险关键词的内容标记出来，供人工审核/客服优先处理，
 * 本身不构成自动下架或封禁决定，最终处置仍需人工判断。
 */

export function parseRiskKeywords(rawValue: string): string[] {
  return rawValue
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export function findRiskKeywordMatches(
  text: string | null | undefined,
  keywords: string[],
): string[] {
  if (!text || keywords.length === 0) return [];
  return keywords.filter((keyword) => keyword.length > 0 && text.includes(keyword));
}

export function containsRiskKeyword(text: string | null | undefined, keywords: string[]): boolean {
  return findRiskKeywordMatches(text, keywords).length > 0;
}
