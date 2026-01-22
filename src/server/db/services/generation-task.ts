import { db } from '@/server/db';
import {
  generationTask,
  generationResult,
  generationParameters,
  storage,
} from '@/server/db/schema';
import { eq, desc, and, count, isNull } from 'drizzle-orm';

/**
 * 获取任务详情（包括结果和参数）
 */
export async function getGenerationTaskWithResults(taskId: string) {
  // 获取任务基本信息
  const tasks = await db
    .select()
    .from(generationTask)
    .where(eq(generationTask.taskId, taskId))
    .limit(1);

  if (tasks.length === 0) {
    return null;
  }

  const task = tasks[0];

  // 获取结果
  const results = await db
    .select({
      id: generationResult.id,
      storageId: generationResult.storageId,
      watermarkStorageId: generationResult.watermarkStorageId,
      orderIndex: generationResult.orderIndex,
    })
    .from(generationResult)
    .where(eq(generationResult.taskId, task.id))
    .orderBy(generationResult.orderIndex);

  // 获取所有关联的存储信息
  const storageIds = new Set<string>();
  results.forEach((r) => {
    storageIds.add(r.storageId);
    if (r.watermarkStorageId) {
      storageIds.add(r.watermarkStorageId);
    }
  });

  const storageMap = new Map<string, any>();
  if (storageIds.size > 0) {
    const storageRecords = await db
      .select()
      .from(storage);

    storageRecords.forEach((s) => {
      if (storageIds.has(s.id)) {
        storageMap.set(s.id, s);
      }
    });
  }

  // 组装结果
  const formattedResults = results.map((result) => ({
    id: result.id,
    url: storageMap.get(result.storageId)?.url || null,
    watermarkUrl: result.watermarkStorageId ? storageMap.get(result.watermarkStorageId)?.url || null : null,
    mimeType: storageMap.get(result.storageId)?.mimeType || null,
    type: storageMap.get(result.storageId)?.mimeType?.split('/')[0] || null,
  }));

  return {
    ...task,
    results: formattedResults,
  };
}

/**
 * 获取用户的生成历史列表
 */
export async function getUserGenerationHistory(userId: string, limit: number = 20, offset: number = 0) {
  // 获取总数
  const [{ total }] = await db
    .select({ total: count() })
    .from(generationTask)
    .where(
      and(
        eq(generationTask.userId, userId),
        isNull(generationTask.deletedAt)
      )
    );

  // 获取任务列表
  const tasks = await db
    .select({
      id: generationTask.id,
      parameters: generationTask.parameters,
      taskType: generationTask.taskType,
      createdAt: generationTask.createdAt,
      updatedAt: generationTask.updatedAt,
    })
    .from(generationTask)
    .where(
      and(
        eq(generationTask.userId, userId),
        isNull(generationTask.deletedAt)
      )
    )
    .orderBy(desc(generationTask.createdAt))
    .limit(limit)
    .offset(offset);

  // 获取每个任务的结果
  const taskIds = tasks.map(t => t.id);
  const resultsMap = new Map<string, Array<{ id: string; url: string; mimeType: string; type: string }>>();

  if (taskIds.length > 0) {
    for (const taskId of taskIds) {
      const taskResults = await db
        .select({
          id: generationResult.id,
          url: storage.url,
          mimeType: storage.mimeType,
          orderIndex: generationResult.orderIndex,
        })
        .from(generationResult)
        .innerJoin(storage, eq(generationResult.storageId, storage.id))
        .where(eq(generationResult.taskId, taskId))
        .orderBy(generationResult.orderIndex);

      resultsMap.set(
        taskId,
        taskResults.map(r => ({
          id: r.id,
          url: r.url,
          mimeType: r.mimeType,
          type: r.mimeType?.split('/')[0] || "unknown",
        }))
      );
    }
  }

  // 组装历史记录
  const histories = tasks.map((task) => {
    const parameters = task.parameters as Record<string, any> || {};
    const resultsArray = resultsMap.get(task.id) || [];

    return {
      id: task.id,
      prompt: parameters.prompt || "",
      results: resultsArray,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  });

  return {
    histories,
    total,
    limit,
    offset,
    hasMore: offset + histories.length < total,
  };
}

/**
 * 更新任务状态
 */
export async function updateGenerationTaskStatus(
  taskId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  updates: Record<string, any> = {}
) {
  return db
    .update(generationTask)
    .set({
      status,
      updatedAt: new Date(),
      ...updates,
    })
    .where(eq(generationTask.taskId, taskId));
}

/**
 * 标记任务失败
 */
export async function failGenerationTask(
  taskId: string,
  errorMessage: Record<string, any>,
  durationMs?: number,
  refundTransactionId?: string
) {
  return db
    .update(generationTask)
    .set({
      status: 'failed',
      errorMessage,
      refundTransactionId,
      completedAt: new Date(),
      durationMs,
      updatedAt: new Date(),
    })
    .where(eq(generationTask.taskId, taskId));
}

/**
 * 软删除历史记录
 */
export async function deleteGenerationHistory(taskId: string, userId: string) {
  const tasks = await db
    .select({ id: generationTask.id })
    .from(generationTask)
    .where(
      and(
        eq(generationTask.id, taskId),
        eq(generationTask.userId, userId)
      )
    )
    .limit(1);

  if (tasks.length === 0) {
    throw new Error('Task not found or unauthorized');
  }

  return db
    .update(generationTask)
    .set({ deletedAt: new Date() })
    .where(eq(generationTask.id, taskId));
}

/**
 * 保存生成结果到 generationResult 和 storage 表
 */
export async function saveGenerationResults(
  taskId: string,
  results: Array<{
    storageId: string;
    watermarkStorageId?: string;
    orderIndex: number;
  }>
) {
  // 获取任务 ID
  const tasks = await db
    .select({ id: generationTask.id })
    .from(generationTask)
    .where(eq(generationTask.taskId, taskId))
    .limit(1);

  if (tasks.length === 0) {
    throw new Error('Task not found');
  }

  const task = tasks[0];

  // 保存每个结果
  for (const result of results) {
    await db
      .insert(generationResult)
      .values({
        taskId: task.id,
        storageId: result.storageId,
        watermarkStorageId: result.watermarkStorageId,
        orderIndex: result.orderIndex,
      });
  }
}

/**
 * 保存生成参数引用的资源
 */
export async function saveGenerationParameters(
  taskId: string,
  parameters: Array<{
    storageId: string;
    paramType: string;
  }>
) {
  // 获取任务 ID
  const tasks = await db
    .select({ id: generationTask.id })
    .from(generationTask)
    .where(eq(generationTask.taskId, taskId))
    .limit(1);

  if (tasks.length === 0) {
    throw new Error('Task not found');
  }

  const task = tasks[0];

  // 保存每个参数
  for (const param of parameters) {
    await db
      .insert(generationParameters)
      .values({
        taskId: task.id,
        storageId: param.storageId,
        paramType: param.paramType,
      });
  }
}
