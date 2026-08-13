"use client";

import { type ReactNode, useEffect, useState } from "react";
import { MapPinOff, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

const REGION_STORAGE_KEY = "expectaly:declared-region";

/**
 * 收货地区选项，取值与 Address.province 的命名习惯一致，供用户自我声明收货地区。
 * 该列表与具体商品的 restrictedRegions 配置为独立数据源，不构成官方行政区划或法规清单。
 */
export const DECLARED_REGION_OPTIONS = [
  "北京市",
  "上海市",
  "广东省",
  "浙江省",
  "西藏自治区",
  "香港特别行政区",
  "澳门特别行政区",
  "台湾地区",
];

function ageConfirmationKey(contextType: string, contextId: string): string {
  return `expectaly:age-confirmed:${contextType}:${contextId}`;
}

function readAgeConfirmed(contextType: string, contextId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ageConfirmationKey(contextType, contextId)) === "true";
  } catch {
    return false;
  }
}

function writeAgeConfirmed(contextType: string, contextId: string): void {
  try {
    window.localStorage.setItem(ageConfirmationKey(contextType, contextId), "true");
  } catch {
    // 本地存储不可用时静默忽略，不阻断当前会话内的确认状态
  }
}

function readDeclaredRegion(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(REGION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeDeclaredRegion(region: string): void {
  try {
    window.localStorage.setItem(REGION_STORAGE_KEY, region);
  } catch {
    // 本地存储不可用时静默忽略
  }
}

export interface AgeConfirmationGateProps {
  contextType: "product" | "category";
  contextId: string;
  minimumAge: number;
  /** 该商品受限的收货地区列表（示例数据，具体清单待法务与合规团队最终确认）。 */
  restrictedRegions?: string[];
  children: ReactNode;
}

/**
 * 受限制商品的年龄确认 + 地区限制自我声明组件。
 * 年龄确认按 contextType/contextId 写入本地存储（对应数据库实体 age_confirmations 的第一期本地实现，
 * 未来接入 Supabase 后可平滑切换为服务端写入，不构成完整身份验证）；
 * 收货地区为用户自我声明，与 Address 簿中的真实收货地址无关，仅用于本地演示地区限制拦截效果。
 */
export function AgeConfirmationGate({
  contextType,
  contextId,
  minimumAge,
  restrictedRegions = [],
  children,
}: AgeConfirmationGateProps) {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [declaredRegion, setDeclaredRegionState] = useState<string | null>(null);

  useEffect(() => {
    // 服务端渲染后的首次客户端同步，避免直接在渲染阶段读取 localStorage 导致 hydration 不一致
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAgeConfirmed(readAgeConfirmed(contextType, contextId));
    setDeclaredRegionState(readDeclaredRegion());
  }, [contextType, contextId]);

  function confirmAge() {
    writeAgeConfirmed(contextType, contextId);
    setAgeConfirmed(true);
  }

  function declareRegion(region: string) {
    writeDeclaredRegion(region);
    setDeclaredRegionState(region);
  }

  function resetRegion() {
    writeDeclaredRegion("");
    setDeclaredRegionState(null);
  }

  if (!ageConfirmed) {
    return (
      <div className="border-warning-200 bg-warning-50 flex flex-col gap-3 rounded-xs border p-6">
        <div className="flex items-center gap-2">
          <ShieldAlert aria-hidden="true" className="text-warning-900 h-5 w-5" />
          <h2 className="text-ink text-sm font-semibold">该商品分类受年龄限制</h2>
        </div>
        <p className="text-ink-muted text-sm">
          平台不向未成年人销售此类商品。继续查看购买与联系方式前，请确认你已达到所在地区法定年龄 （
          {minimumAge}{" "}
          周岁及以上）。商品可能受到进口、税务、运输与海关政策限制，请遵守所在地法律法规。
        </p>
        <Button variant="primary" className="w-fit" onClick={confirmAge}>
          我已确认达到当地法定年龄
        </Button>
      </div>
    );
  }

  if (restrictedRegions.length === 0) {
    return <>{children}</>;
  }

  if (!declaredRegion) {
    return (
      <div className="border-warning-200 bg-warning-50 flex flex-col gap-3 rounded-xs border p-6">
        <div className="flex items-center gap-2">
          <MapPinOff aria-hidden="true" className="text-warning-900 h-5 w-5" />
          <h2 className="text-ink text-sm font-semibold">该商品分类受收货地区限制</h2>
        </div>
        <p className="text-ink-muted text-sm">
          请先声明你的收货地区，平台将据此判断该商品是否支持配送至你所在地区。
        </p>
        <Select
          aria-label="请选择收货地区"
          options={DECLARED_REGION_OPTIONS.map((region) => ({ value: region, label: region }))}
          placeholder="请选择收货地区"
          className="max-w-xs"
          onChange={(event) => declareRegion(event.target.value)}
        />
      </div>
    );
  }

  if (restrictedRegions.includes(declaredRegion)) {
    return (
      <div className="border-danger-200 bg-danger-50 flex flex-col gap-3 rounded-xs border p-6">
        <div className="flex items-center gap-2">
          <MapPinOff aria-hidden="true" className="text-danger-900 h-5 w-5" />
          <h2 className="text-ink text-sm font-semibold">暂不支持配送至「{declaredRegion}」</h2>
        </div>
        <p className="text-ink-muted text-sm">
          该商品因进口、税务或海关政策限制，暂不支持配送至你声明的收货地区（示例限制，具体地区清单待合规团队最终确认）。
        </p>
        <Button variant="secondary" className="w-fit" onClick={resetRegion}>
          重新选择收货地区
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
