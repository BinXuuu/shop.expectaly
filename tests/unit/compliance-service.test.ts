import { describe, expect, it } from "vitest";
import {
  containsRiskKeyword,
  findRiskKeywordMatches,
  parseRiskKeywords,
} from "@/lib/services/compliance-service";

describe("compliance-service", () => {
  it("parses a comma-separated keyword string into a trimmed array", () => {
    expect(parseRiskKeywords("假货, 仿品 ,一比一,高仿")).toEqual([
      "假货",
      "仿品",
      "一比一",
      "高仿",
    ]);
  });

  it("ignores empty segments when parsing keywords", () => {
    expect(parseRiskKeywords("假货,,仿品,")).toEqual(["假货", "仿品"]);
  });

  it("finds every keyword that appears as a substring of the text", () => {
    const matches = findRiskKeywordMatches("这是一比一高仿复刻款", ["假货", "一比一", "高仿"]);
    expect(matches).toEqual(["一比一", "高仿"]);
  });

  it("returns no matches for empty or null text", () => {
    expect(findRiskKeywordMatches(null, ["假货"])).toEqual([]);
    expect(findRiskKeywordMatches("", ["假货"])).toEqual([]);
  });

  it("returns no matches when the keyword list is empty", () => {
    expect(findRiskKeywordMatches("任意内容", [])).toEqual([]);
  });

  it("containsRiskKeyword reflects whether any keyword matched", () => {
    expect(containsRiskKeyword("纯正品，无仿冒", ["假货"])).toBe(false);
    expect(containsRiskKeyword("怀疑是假货", ["假货"])).toBe(true);
  });
});
