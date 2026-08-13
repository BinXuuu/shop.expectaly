/**
 * 统一错误格式与服务层返回值约定。
 * 所有 lib/repositories、lib/services 对外暴露的函数都应返回 Result<T>，
 * 而不是直接抛出未分类的异常，便于页面层统一处理 loading / error / empty 状态。
 */

export type AppErrorCode =
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "PERMISSION_DENIED"
  | "UNAUTHENTICATED"
  | "CONFLICT"
  | "FEATURE_DISABLED"
  | "RATE_LIMITED"
  | "EXTERNAL_SERVICE_ERROR"
  | "UNKNOWN_ERROR";

export interface AppErrorShape {
  code: AppErrorCode;
  message: string;
  /** 字段级校验错误等结构化详情，键为字段名 */
  details?: Record<string, string>;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: AppErrorShape };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function err<T = never>(error: AppErrorShape): Result<T> {
  return { ok: false, error };
}
