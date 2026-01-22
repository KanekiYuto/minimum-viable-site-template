/**
 * 积分管理模块
 */

export { creditConfig, getDailyFreeCredit, type UserType } from "./config";
export { checkAndIssueDailyCredit } from "./daily-credit";
export { getAvailableCredit, getAllUserCredits } from "./query";
export {
  consumeCredit,
  refundCredit,
  type ConsumeCreditResult,
  type RefundCreditResult,
} from "./transaction";
