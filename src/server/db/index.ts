import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 20, // 最大连接数
  min: 2, // 最小连接数
  idleTimeoutMillis: 30000, // 空闲连接超时 30秒
  connectionTimeoutMillis: 60000, // 连接超时 60秒（从10秒增加到60秒）
  allowExitOnIdle: true,
  // 连接重试配置
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  // 语句超时
  statement_timeout: 30000, // 单个查询超时 30秒
});

// 监听连接池错误
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export const db = drizzle(pool, { schema });
