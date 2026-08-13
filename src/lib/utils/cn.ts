import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** 合并 className，自动去除冲突的 Tailwind 工具类（后者覆盖前者）。 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
