import { db } from '@/server/db';
import { asset, storage } from '@/server/db/schema';
import { eq, desc, and, count, isNull, inArray } from 'drizzle-orm';

/**
 * 创建资源记录（包括 storage 和 asset）
 */
export async function createAsset(
  userId: string,
  storageData: {
    key: string;
    url: string;
    filename: string;
    originalFilename: string;
    type: string;
    mimeType: string;
    size: number;
  },
  assetData: {
    tags?: string[] | null;
    description?: string | null;
  } = {}
) {
  // 1. 创建 storage 记录
  const [storageRecord] = await db
    .insert(storage)
    .values(storageData)
    .returning();

  // 2. 创建 asset 记录
  const [newAsset] = await db
    .insert(asset)
    .values({
      userId,
      storageId: storageRecord.id,
      ...assetData,
    })
    .returning();

  return {
    asset: newAsset,
    storage: storageRecord,
  };
}

/**
 * 获取用户的资源列表（分页）
 */
export async function getUserAssets(
  userId: string,
  type?: string,
  limit: number = 20,
  offset: number = 0
) {
  // 构建查询条件
  const conditions = [
    eq(asset.userId, userId),
    isNull(asset.deletedAt),
  ];
  if (type) {
    conditions.push(eq(storage.type, type));
  }

  // 获取总数
  const [{ total }] = await db
    .select({ total: count() })
    .from(asset)
    .innerJoin(storage, eq(asset.storageId, storage.id))
    .where(conditions.length > 1 ? and(...conditions) : conditions[0]);

  // 执行分页查询
  const results = await db
    .select({
      id: asset.id,
      filename: storage.filename,
      originalFilename: storage.originalFilename,
      url: storage.url,
      type: storage.type,
      mimeType: storage.mimeType,
      size: storage.size,
      tags: asset.tags,
      description: asset.description,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    })
    .from(asset)
    .innerJoin(storage, eq(asset.storageId, storage.id))
    .where(conditions.length > 1 ? and(...conditions) : conditions[0])
    .orderBy(desc(asset.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    assets: results,
    total,
    limit,
    offset,
    hasMore: offset + results.length < total,
  };
}

/**
 * 获取单个资源详情
 */
export async function getAsset(assetId: string, userId: string) {
  const results = await db
    .select({
      id: asset.id,
      filename: storage.filename,
      originalFilename: storage.originalFilename,
      url: storage.url,
      type: storage.type,
      mimeType: storage.mimeType,
      size: storage.size,
      tags: asset.tags,
      description: asset.description,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    })
    .from(asset)
    .innerJoin(storage, eq(asset.storageId, storage.id))
    .where(
      and(
        eq(asset.id, assetId),
        eq(asset.userId, userId),
        isNull(asset.deletedAt)
      )
    )
    .limit(1);

  return results.length > 0 ? results[0] : null;
}

/**
 * 更新资源信息
 */
export async function updateAsset(
  assetId: string,
  userId: string,
  data: {
    tags?: string[] | null;
    description?: string | null;
  }
) {
  return db
    .update(asset)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(asset.id, assetId),
        eq(asset.userId, userId)
      )
    );
}

/**
 * 软删除资源
 */
export async function deleteAsset(assetId: string, userId: string) {
  return db
    .update(asset)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(asset.id, assetId),
        eq(asset.userId, userId)
      )
    );
}

/**
 * 批量软删除资源
 */
export async function deleteAssets(assetIds: string[], userId: string) {
  return db
    .update(asset)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(asset.userId, userId),
        inArray(asset.id, assetIds)
      )
    );
}
