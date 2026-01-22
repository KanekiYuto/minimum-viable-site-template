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
