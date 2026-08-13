import type { AppErrorCode, AppErrorShape } from "@/types";

/**
 * 统一错误类。服务层内部可以 throw new AppError(...)，
 * 由调用方（通常是 lib/services 的最外层函数）捕获并转换为 Result<T> 的 err() 分支，
 * 页面 / API Route 不应直接接触未分类的原生 Error。
 */
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly details?: Record<string, string>;

  constructor(shape: AppErrorShape) {
    super(shape.message);
    this.name = "AppError";
    this.code = shape.code;
    this.details = shape.details;
  }

  toShape(): AppErrorShape {
    return { code: this.code, message: this.message, details: this.details };
  }

  static notFound(message = "请求的资源不存在"): AppError {
    return new AppError({ code: "NOT_FOUND", message });
  }

  static validation(message: string, details?: Record<string, string>): AppError {
    return new AppError({ code: "VALIDATION_ERROR", message, details });
  }

  static permissionDenied(message = "没有权限执行该操作"): AppError {
    return new AppError({ code: "PERMISSION_DENIED", message });
  }

  static unauthenticated(message = "请先登录"): AppError {
    return new AppError({ code: "UNAUTHENTICATED", message });
  }

  static conflict(message: string): AppError {
    return new AppError({ code: "CONFLICT", message });
  }

  static featureDisabled(message = "该功能尚未开放"): AppError {
    return new AppError({ code: "FEATURE_DISABLED", message });
  }
}

/** 将任意异常安全转换为 AppErrorShape，供 Result<T> 的 err() 分支使用 */
export function toAppErrorShape(error: unknown): AppErrorShape {
  if (error instanceof AppError) {
    return error.toShape();
  }
  if (error instanceof Error) {
    return { code: "UNKNOWN_ERROR", message: error.message };
  }
  return { code: "UNKNOWN_ERROR", message: "发生未知错误" };
}
