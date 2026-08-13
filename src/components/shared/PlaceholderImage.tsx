import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface PlaceholderImageProps {
  label: string;
  aspect?: "square" | "portrait" | "landscape";
  className?: string;
}

const aspectClasses = {
  square: "aspect-square",
  portrait: "aspect-3/4",
  landscape: "aspect-4/3",
};

/**
 * 图片占位组件：第一期尚未接入真实图片资源（本地占位图/Supabase Storage 待后续阶段），
 * 使用克制的渐变色块代替，避免出现 404 图片或廉价占位图标带来的模板感。
 */
export function PlaceholderImage({ label, aspect = "square", className }: PlaceholderImageProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "from-brand-50 to-surface-muted flex items-center justify-center bg-gradient-to-br",
        aspectClasses[aspect],
        className,
      )}
    >
      <ImageOff aria-hidden="true" className="text-brand-200 h-6 w-6" />
    </div>
  );
}
