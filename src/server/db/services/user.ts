import { db } from '@/server/db';
import { user } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

/**
 * 根据userId获取用户信息
 */
export async function getUserById(userId: string) {
  const [userData] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      type: user.type,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return userData || null;
}

/**
 * 根据userId获取用户类型
 */
export async function getUserType(userId: string) {
  const [userData] = await db
    .select({ type: user.type })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return userData?.type || 'free';
}

/**
 * 更新用户信息
 */
export async function updateUser(
  userId: string,
  data: {
    name?: string;
    image?: string;
  }
) {
  const [updatedUser] = await db
    .update(user)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning();

  return updatedUser || null;
}

/**
 * 更新用户当前订阅 ID
 */
export async function updateUserCurrentSubscription(userId: string, subscriptionId: string) {
  return db
    .update(user)
    .set({ currentSubscriptionId: subscriptionId, updatedAt: new Date() })
    .where(eq(user.id, userId));
}

/**
 * 更新用户方案（一般用于订阅激活/续费）
 */
export async function updateUserPlan(userId: string, planType: string, subscriptionId: string) {
  return db
    .update(user)
    .set({ type: planType, currentSubscriptionId: subscriptionId, updatedAt: new Date() })
    .where(eq(user.id, userId));
}

/**
 * 撤销订阅访问权限：降级为 free，并清空 currentSubscriptionId
 */
export async function revokeUserAccess(userId: string) {
  return db
    .update(user)
    .set({ type: "free", currentSubscriptionId: null, updatedAt: new Date() })
    .where(eq(user.id, userId));
}
