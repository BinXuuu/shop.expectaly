import type { BaseEntity, ID } from "./common";

export type AgeConfirmationContextType = "category" | "product";

/**
 * 对应数据库实体 age_confirmations。
 * 仅记录用户已确认达到适用地区法定年龄，不构成完整身份验证，
 * 参见 docs/COMPLIANCE.md。
 */
export interface AgeConfirmation extends BaseEntity {
  userId: ID | null; // 游客场景下为 null，改用 sessionId
  sessionId: string | null;
  contextType: AgeConfirmationContextType;
  contextId: ID;
  minimumAgeRequired: number;
  confirmed: boolean;
  confirmedAt: string;
}
