import type { Merchant } from "@/types";
import { merchantMemberRepository, merchantRepository } from "@/lib/repositories";

/**
 * 解析当前登录账号所管理的商家。第一期一个账号仅关联一个商家（`merchant_members` 首条记录），
 * 未来支持一人管理多商家时，可在商家后台增加「切换店铺」入口而不改动此函数签名。
 */
export async function getManagedMerchant(profileId: string): Promise<Merchant | null> {
  const membershipResult = await merchantMemberRepository.findByUser(profileId);
  if (!membershipResult.ok || membershipResult.data.length === 0) {
    return null;
  }

  const merchantResult = await merchantRepository.findById(membershipResult.data[0].merchantId);
  return merchantResult.ok ? merchantResult.data : null;
}
