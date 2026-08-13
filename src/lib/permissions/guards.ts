import type { Role } from "@/types";
import { AppError } from "@/lib/errors/app-error";
import { ROLE_PERMISSIONS, SUPER_ADMIN_ONLY, type PermissionKey } from "./matrix";

/**
 * 权限判断必须同时存在于 UI 层（隐藏/禁用按钮）与数据访问层（服务端拒绝越权请求）。
 * 本文件是数据访问层校验的唯一入口，lib/repositories 与 lib/services 中的写操作
 * 都应调用 assertPermission()，而不是只在页面组件里判断。
 */

export function hasRole(roles: Role[], role: Role): boolean {
  return roles.includes(role);
}

export function isSuperAdmin(roles: Role[]): boolean {
  return hasRole(roles, "super_admin");
}

export function can(roles: Role[], permission: PermissionKey): boolean {
  if (isSuperAdmin(roles)) {
    return true;
  }
  return roles.some((role) => {
    if (role === "super_admin") return true;
    const grants = ROLE_PERMISSIONS[role];
    return grants?.includes(permission) ?? false;
  });
}

/** 仅 super_admin 可执行的操作（角色管理、系统关键设置） */
export function canSuperAdminOnly(
  roles: Role[],
  permission: (typeof SUPER_ADMIN_ONLY)[number],
): boolean {
  return isSuperAdmin(roles) && SUPER_ADMIN_ONLY.includes(permission);
}

/**
 * 服务端断言：无权限时抛出 AppError("PERMISSION_DENIED")。
 * 调用方（lib/services）应捕获后转换为 Result<T> 的 err() 分支。
 */
export function assertPermission(roles: Role[], permission: PermissionKey): void {
  if (!can(roles, permission)) {
    throw AppError.permissionDenied(`当前角色无权执行操作：${permission}`);
  }
}

export function assertAuthenticated(userId: string | null | undefined): asserts userId is string {
  if (!userId) {
    throw AppError.unauthenticated();
  }
}

/** 判断某条数据是否归属于当前用户（用于 view_own / update_own 场景的二次校验） */
export function assertOwnsResource(ownerId: string | null, currentUserId: string | null): void {
  if (!currentUserId || !ownerId || ownerId !== currentUserId) {
    throw AppError.permissionDenied("无权访问他人数据");
  }
}
