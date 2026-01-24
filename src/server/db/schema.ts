import { pgTable, text, timestamp, boolean, integer, uuid, index, jsonb } from 'drizzle-orm/pg-core';

// 用户表
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  // 用户类型: free(免费), basic(基础版), pro(专业版), plus(专业版)
  type: text('type').notNull().default('free'),
  // 当前活跃的订阅ID
  currentSubscriptionId: uuid('current_subscription_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  // 邮箱登录查询
  index('user_email_idx').on(table.email),
  // 用户创建时间查询
  index('user_created_at_idx').on(table.createdAt),
  // 用户类型查询
  index('user_type_idx').on(table.type),
]);

// 积分信息表
export const credit = pgTable('credit', {
  // UUID 主键,由数据库自动生成
  id: uuid('id').primaryKey().defaultRandom(),
  // 用户ID
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  // 关联的交易ID (可选,免费配额时为空)
  transactionId: uuid('transaction_id').references(() => transaction.id, { onDelete: 'cascade' }),
  // 配额类型: daily_free(免费配额-每日), quota_pack(配额包), subscriptionPlanType(<billingCycle>_<planId>，例如 monthly_basic/yearly_pro)
  type: text('type').notNull(),
  // 配额数量 (默认为 0)
  amount: integer('amount').notNull().default(0),
  // 已消耗配额数量
  consumed: integer('consumed').notNull().default(0),
  // 下发时间
  issuedAt: timestamp('issued_at').notNull(),
  // 过期时间 (null 表示永不过期)
  expiresAt: timestamp('expires_at'),
  // 创建时间
  createdAt: timestamp('created_at').notNull().defaultNow(),
  // 更新时间
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  // 查询用户配额
  index('credit_user_id_idx').on(table.userId),
  // 有效配额查询（未过期或永不过期）
  index('credit_user_id_expires_at_idx').on(table.userId, table.expiresAt),
  // 用户配额类型复合查询
  index('credit_user_id_type_idx').on(table.userId, table.type),
  // 配额类型过滤
  index('credit_type_idx').on(table.type),
  // 交易ID查询
  index('credit_transaction_id_idx').on(table.transactionId),
]);


// 积分交易记录表
export const creditTransaction = pgTable('credit_transaction', {
  // UUID 主键,由数据库自动生成
  id: uuid('id').primaryKey().defaultRandom(),
  // 用户ID
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  // 关联的配额ID
  creditId: uuid('credit_id')
    .notNull()
    .references(() => credit.id, { onDelete: 'cascade' }),
  // 交易类型: consume(消费), refund(退款)
  type: text('type').notNull(),
  // 变更数量 (正数为增加,负数为减少)
  amount: integer('amount').notNull(),
  // 交易前余额
  balanceBefore: integer('balance_before').notNull(),
  // 交易后余额
  balanceAfter: integer('balance_after').notNull(),
  // 关联的交易ID (用于退款时关联原始消费交易)
  relatedTransactionId: uuid('related_transaction_id'),
  // 备注说明
  note: text('note'),
  // 创建时间
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  // 用户配额交易查询
  index('credit_transaction_user_id_idx').on(table.userId),
  // 用户时间范围查询（倒序）
  index('credit_transaction_user_id_created_at_idx').on(table.userId, table.createdAt.desc()),
  // 用户交易类型查询
  index('credit_transaction_user_id_type_idx').on(table.userId, table.type),
  // 配额ID查询
  index('credit_transaction_credit_id_idx').on(table.creditId),
  // 配额交易类型过滤
  index('credit_transaction_type_idx').on(table.type),
  // 关联交易查询（用于追踪退款）
  index('credit_transaction_related_transaction_id_idx').on(table.relatedTransactionId),
]);

// 交易记录表
export const transaction = pgTable('transaction', {
  // UUID 主键,由数据库自动生成
  id: uuid('id').primaryKey().defaultRandom(),
  // 用户ID
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  // 关联的订阅ID (可选,一次性支付时为空)
  subscriptionId: uuid('subscription_id').references(() => subscription.id, { onDelete: 'cascade' }),
  // 支付平台: creem, stripe, paypal 等
  paymentPlatform: text('payment_platform').notNull(),
  // 支付平台的交易ID
  paymentTransactionId: text('payment_transaction_id').notNull().unique(),
  // 支付平台的产品ID
  productId: text('product_id').notNull(),
  // 交易类型: subscription_payment(订阅支付), one_time_payment(一次性支付), refund(退款)
  type: text('type').notNull(),
  // 交易金额(分/美分)
  amount: integer('amount').notNull(),
  // 货币类型: USD, CNY 等
  currency: text('currency').notNull().default('USD'),
  // 创建时间
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  // 用户交易查询
  index('transaction_user_id_idx').on(table.userId),
  // 用户时间范围查询（倒序）
  index('transaction_user_id_created_at_idx').on(table.userId, table.createdAt.desc()),
  // 用户交易类型查询
  index('transaction_user_id_type_idx').on(table.userId, table.type),
  // 订阅ID查询
  index('transaction_subscription_id_idx').on(table.subscriptionId),
  // 支付平台产品ID查询
  index('transaction_product_id_idx').on(table.productId),
  // 支付平台交易ID快速查询（已设为 unique，自动创建索引）
  // 交易类型过滤
  index('transaction_type_idx').on(table.type),
]);

// 订阅信息表
export const subscription = pgTable('subscription', {
  // UUID 主键,由数据库自动生成
  id: uuid('id').primaryKey().defaultRandom(),
  // 用户ID
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  // 支付平台: creem, stripe, paypal 等
  paymentPlatform: text('payment_platform').notNull(),
  // 支付平台的订阅ID
  paymentSubscriptionId: text('payment_subscription_id').notNull().unique(),
  // 支付平台的客户ID
  paymentCustomerId: text('payment_customer_id'),
  // 支付平台的产品ID
  productId: text('product_id').notNull(),
  // 订阅计划类型: <billingCycle>_<planId>（例如 monthly_basic/yearly_pro）
  planType: text('plan_type').notNull(),
  // 下次计划类型: 用于计划升级/降级,在下次续费时生效
  nextPlanType: text('next_plan_type'),
  // 订阅状态: active(活跃), canceled(已取消), expired(已过期), pending(待支付)
  status: text('status').notNull().default('pending'),
  // 订阅金额(分/美分)
  amount: integer('amount').notNull(),
  // 货币类型: USD, CNY 等
  currency: text('currency').notNull().default('USD'),
  // 订阅开始时间
  startedAt: timestamp('started_at'),
  // 订阅结束时间
  expiresAt: timestamp('expires_at'),
  // 下次续费时间
  nextBillingAt: timestamp('next_billing_at'),
  // 取消时间
  canceledAt: timestamp('canceled_at'),
  // 创建时间
  createdAt: timestamp('created_at').notNull().defaultNow(),
  // 更新时间
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  // 用户订阅查询
  index('subscription_user_id_idx').on(table.userId),
  // 用户订阅状态查询
  index('subscription_user_id_status_idx').on(table.userId, table.status),
  // 用户计划类型查询
  index('subscription_user_id_plan_type_idx').on(table.userId, table.planType),
  // 支付平台订阅ID快速查询（已设为 unique，自动创建索引）
  // 支付平台客户ID查询
  index('subscription_payment_customer_id_idx').on(table.paymentCustomerId),
  // 支付平台产品ID查询
  index('subscription_product_id_idx').on(table.productId),
  // 续费时间扫描（活跃订阅的续费提醒）
  index('subscription_next_billing_at_idx').on(table.nextBillingAt),
  // 状态和续费时间复合查询
  index('subscription_status_next_billing_at_idx').on(table.status, table.nextBillingAt),
  // 订阅状态过滤
  index('subscription_status_idx').on(table.status),
  // 过期时间查询（用于清理过期订阅）
  index('subscription_expires_at_idx').on(table.expiresAt),
]);

// 存储表 - S3资源管理
export const storage = pgTable('storage', {
  // UUID 主键,由数据库自动生成
  id: uuid('id').primaryKey().defaultRandom(),
  // S3 key (存储路径)
  key: text('key').notNull().unique(),
  // 资源URL
  url: text('url').notNull(),
  // 文件名
  filename: text('filename').notNull(),
  // 原始文件名
  originalFilename: text('original_filename').notNull(),
  // 资源类型: image(图片), video(视频), audio(音频), document(文档), other(其他)
  type: text('type').notNull(),
  // MIME类型: image/png, video/mp4 等
  mimeType: text('mime_type').notNull(),
  // 文件大小(字节)
  size: integer('size').notNull(),
  // 元数据 (JSON 格式: 宽度、高度、时长等)
  metadata: jsonb('metadata'),
  // 创建时间
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  // S3 key 快速查询（已设为 unique，自动创建索引）
  // 资源类型过滤
  index('storage_type_idx').on(table.type),
  // 创建时间查询
  index('storage_created_at_idx').on(table.createdAt),
]);

// 素材表
export const asset = pgTable('asset', {
  // UUID 主键,由数据库自动生成
  id: uuid('id').primaryKey().defaultRandom(),
  // 用户ID
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  // 存储资源ID (外键引用)
  storageId: uuid('storage_id')
    .notNull()
    .references(() => storage.id, { onDelete: 'cascade' }),
  // 标签(用于分类和搜索)
  tags: text('tags').array(),
  // 描述
  description: text('description'),
  // 创建时间
  createdAt: timestamp('created_at').notNull().defaultNow(),
  // 更新时间
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  // 删除时间 (软删除标记)
  deletedAt: timestamp('deleted_at'),
}, (table) => [
  // 用户素材查询
  index('asset_user_id_idx').on(table.userId),
  // 用户时间范围查询（倒序）
  index('asset_user_id_created_at_idx').on(table.userId, table.createdAt.desc()),
  // 存储资源ID查询
  index('asset_storage_id_idx').on(table.storageId),
  // 软删除逻辑查询
  index('asset_deleted_at_idx').on(table.deletedAt),
  // 用户未删除的素材查询
  index('asset_user_id_deleted_at_idx').on(table.userId, table.deletedAt),
]);

// 生成任务表
export const generationTask = pgTable('generation_task', {
  // UUID 主键,由数据库自动生成
  id: uuid('id').primaryKey().defaultRandom(),
  // 任务ID (UUID格式,用于前端查询和 webhook 回调)
  taskId: uuid('task_id').notNull().unique(),
  // 分享ID (短ID,用于分享链接)
  shareId: text('share_id').notNull().unique(),
  // 用户ID
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  // 任务类型: text_to_image(文生图), image_to_image(图生图)
  taskType: text('task_type').notNull(),
  // 服务商: fal, wavespeed, replicate 等
  provider: text('provider').notNull(),
  // 服务商平台的请求ID (可选)
  providerRequestId: text('provider_request_id'),
  // 使用的模型: nano_banana_pro, flux_schnell, flux_dev 等
  model: text('model').notNull(),
  // 任务状态: pending(排队中), processing(生成中), completed(已完成), failed(失败), canceled(已取消)
  status: text('status').notNull().default('pending'),
  // 进度百分比 (0-100)
  progress: integer('progress').notNull().default(0),
  // 生成参数 (JSON 格式存储: prompt、negativePrompt、aspectRatio、numImages、seed、steps、guidanceScale 等)
  parameters: jsonb('parameters').notNull(),
  // 消费的配额交易记录ID
  consumeTransactionId: uuid('consume_transaction_id')
    .notNull()
    .references(() => creditTransaction.id, { onDelete: 'cascade' }),
  // 退款的配额交易记录ID (可选)
  refundTransactionId: uuid('refund_transaction_id').references(() => creditTransaction.id, { onDelete: 'set null' }),
  // 错误信息 (JSONB 格式存储错误详情: {message, code, stack, details})
  errorMessage: jsonb('error_message'),
  // 任务开始时间
  startedAt: timestamp('started_at').notNull(),
  // 任务完成时间
  completedAt: timestamp('completed_at'),
  // 生成耗时 (毫秒)
  durationMs: integer('duration_ms'),
  // 创建时间
  createdAt: timestamp('created_at').notNull().defaultNow(),
  // 更新时间
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  // 删除时间 (软删除标记)
  deletedAt: timestamp('deleted_at'),
  // 是否私有 (私有任务不对外展示)
  isPrivate: boolean('is_private').notNull().default(false),
  // 是否包含 NSFW 内容
  isNsfw: boolean('is_nsfw').notNull().default(false),
  // NSFW 内容审核详情 (JSON 格式: {harassment, hate, sexual, sexual/minors, violence})
  nsfwDetails: jsonb('nsfw_details'),
}, (table) => [
  // 用户任务查询、状态过滤
  index('generation_task_user_id_idx').on(table.userId),
  index('generation_task_user_id_status_idx').on(table.userId, table.status),
  // 任务状态过滤、处理中任务扫描
  index('generation_task_status_idx').on(table.status),
  // 公开分享任务查询 (用于 sitemap 生成)
  index('generation_task_is_private_deleted_at_idx').on(table.isPrivate, table.deletedAt),
  index('generation_task_is_nsfw_deleted_at_idx').on(table.isNsfw, table.deletedAt),
  // 软删除逻辑查询
  index('generation_task_deleted_at_idx').on(table.deletedAt),
  // 创建时间范围查询、分页
  index('generation_task_created_at_idx').on(table.createdAt),
  // 任务类型统计
  index('generation_task_task_type_idx').on(table.taskType),
  // webhook 回调查询
  index('generation_task_provider_request_id_idx').on(table.providerRequestId),
]);

// 生成任务结果表 - 关联任务和存储资源
export const generationResult = pgTable('generation_result', {
  // UUID 主键,由数据库自动生成
  id: uuid('id').primaryKey().defaultRandom(),
  // 任务ID
  taskId: uuid('task_id')
    .notNull()
    .references(() => generationTask.id, { onDelete: 'cascade' }),
  // 存储资源ID
  storageId: uuid('storage_id')
    .notNull()
    .references(() => storage.id, { onDelete: 'cascade' }),
  // 水印资源ID (可选)
  watermarkStorageId: uuid('watermark_storage_id').references(() => storage.id, { onDelete: 'set null' }),
  // 结果序号 (用于保持多个结果的顺序)
  orderIndex: integer('order_index').notNull(),
  // 创建时间
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  // 任务结果查询
  index('generation_result_task_id_idx').on(table.taskId),
  // 存储资源ID查询
  index('generation_result_storage_id_idx').on(table.storageId),
  // 水印资源ID查询
  index('generation_result_watermark_storage_id_idx').on(table.watermarkStorageId),
  // 任务和序号的复合查询
  index('generation_result_task_id_order_idx').on(table.taskId, table.orderIndex),
]);

// 生成任务参数表 - 存储生成参数中的资源（如图生图的输入图片）
export const generationParameters = pgTable('generation_parameters', {
  // UUID 主键,由数据库自动生成
  id: uuid('id').primaryKey().defaultRandom(),
  // 任务ID
  taskId: uuid('task_id')
    .notNull()
    .references(() => generationTask.id, { onDelete: 'cascade' }),
  // 存储资源ID
  storageId: uuid('storage_id')
    .notNull()
    .references(() => storage.id, { onDelete: 'cascade' }),
  // 参数类型: image(输入图片), mask(蒙版), reference(参考图) 等
  paramType: text('param_type').notNull(),
  // 创建时间
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  // 任务参数查询
  index('generation_parameters_task_id_idx').on(table.taskId),
  // 存储资源ID查询
  index('generation_parameters_storage_id_idx').on(table.storageId),
  // 任务和参数类型的复合查询
  index('generation_parameters_task_id_param_type_idx').on(table.taskId, table.paramType),
]);

// 重新导出 better-auth 表
export * from './auth-schema';
