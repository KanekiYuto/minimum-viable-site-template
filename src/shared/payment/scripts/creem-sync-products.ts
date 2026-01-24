import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import dotenv from 'dotenv';
import { createCreem } from 'creem_io';
import { CREDIT_PACKS, SUBSCRIPTIONS } from '../catalog/catalog';
import { parseSubscriptionPlanType } from '../subscription-key';

/**
 * 使用方式:
 * 1) 本地(默认):
 *    `pnpm creem:sync-products`
 *    `NODE_ENV=development pnpm creem:sync-products`
 * 2) 指定环境:
 *    `pnpm creem:sync-products --env=local`
 *    `NODE_ENV=production pnpm creem:sync-products --env=prod`
 * 3) 自定义名称前缀:
 *    `pnpm creem:sync-products --name-prefix=YourBrand`
 *
 * 必需环境变量:
 * - CREEM_API_KEY
 *
 * 可选环境变量:
 * - CREEM_PRODUCT_NAME_PREFIX (等价于 --name-prefix)
 */
type EnvKey = 'local' | 'prod';
type BillingCycle = 'monthly' | 'yearly';

const PRODUCTS_PATH = (envKey: EnvKey) =>
  path.join(
    process.cwd(),
    'src',
    'server',
    'payment',
    'providers',
    'creem',
    'products',
    `creem.${envKey}.ts`,
  );
const ENV_FILES_BY_TARGET: Record<EnvKey, string[]> = {
  local: ['.env.local'],
  prod: ['.env'],
};

const parseArgs = (argv: string[]) => {
  const envArg = argv.find((arg) => arg.startsWith('--env='))?.split('=')[1] as EnvKey | undefined;
  const prefixArg = argv.find((arg) => arg.startsWith('--name-prefix='))?.split('=')[1];
  const modeArg = argv.find((arg) => arg.startsWith('--mode='))?.split('=')[1];
  return { envArg, prefixArg, modeArg };
};

const resolveEnv = (envArg?: EnvKey) => {
  const nodeEnv: EnvKey = process.env.NODE_ENV === 'production' ? 'prod' : 'local';
  return envArg ?? nodeEnv;
};

const loadEnvFiles = (env: EnvKey) => {
  ENV_FILES_BY_TARGET[env].forEach((filename) => {
    dotenv.config({ path: path.join(process.cwd(), filename) });
  });
};

const { envArg, prefixArg, modeArg } = parseArgs(process.argv.slice(2));
const env = resolveEnv(envArg);
loadEnvFiles(env);

// 产品价格币种（固定 USD）
const DEFAULT_CURRENCY = 'USD';
// 税费模式固定为不含税
const DEFAULT_TAX_MODE = 'exclusive' as const;
// 税务分类固定为 SaaS
const DEFAULT_TAX_CATEGORY = 'saas' as const;
// 测试模式（testMode）决定使用 Creem 的测试或正式环境
const testMode = modeArg ? modeArg !== 'prod' : env !== 'prod';
// 产品名称前缀（命令行优先，其次环境变量）
const namePrefix = prefixArg || process.env.CREEM_PRODUCT_NAME_PREFIX || 'Picoo';

const apiKey = process.env.CREEM_API_KEY;
if (!apiKey) {
  throw new Error('Missing CREEM_API_KEY');
}

const creem = createCreem({ apiKey, testMode });
const BILLING_TYPE_RECURRING: Parameters<typeof creem.products.create>[0]['billingType'] = 'recurring';
const BILLING_TYPE_ONETIME = 'onetime' as Parameters<typeof creem.products.create>[0]['billingType'];

const titleCase = (value: string) =>
  value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');

const billingLabel = (cycle: BillingCycle) => (cycle === 'monthly' ? 'Monthly' : 'Yearly');
const BILLING_PERIOD_BY_CYCLE: Record<BillingCycle, 'every-month' | 'every-year'> = {
  monthly: 'every-month',
  yearly: 'every-year',
};

const resolveBillingCycle = (planKey: string): BillingCycle => {
  const { billingCycle } = parseSubscriptionPlanType(planKey);
  if (billingCycle === 'monthly' || billingCycle === 'yearly') {
    return billingCycle;
  }
  throw new Error(`Invalid billingCycle for subscription: ${planKey}`);
};

const buildSubscriptionName = (planType: string, cycle: BillingCycle) =>
  `${namePrefix} ${titleCase(planType)} ${billingLabel(cycle)}`;

const buildDayLabel = (days: number) => `${days} day`;

const buildCreditPackName = (name: string, validDays: number) =>
  `${namePrefix} Credits ${titleCase(name)} (${buildDayLabel(validDays)})`;

// 拉取所有产品，用于按名称去重
const listAllProducts = async () => {
  const products: Array<{ id: string; name: string }> = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const result = await creem.products.list({ page, limit });
    result.items.forEach((item) => products.push({ id: item.id, name: item.name }));
    if (!result.pagination.nextPage) {
      break;
    }
    page = result.pagination.nextPage;
  }

  return products;
};

// 若名称不存在则创建产品
const ensureProduct = async (
  name: string,
  createParams: Omit<Parameters<typeof creem.products.create>[0], 'name'>,
  existingByName: Map<string, string>
) => {
  const existing = existingByName.get(name);
  if (existing) {
    return existing;
  }

  const created = await creem.products.create({
    name,
    ...createParams,
  });

  existingByName.set(name, created.id);
  return created.id;
};

type ProductIds = { current: string; historical: string[] };
type CreditPackBase = {
  id: string;
  name: string;
  price: number;
  credits: number;
  validDays: number;
};
type SubscriptionBase = {
  planType: string;
  billingCycle: 'monthly' | 'yearly';
  price: number;
  credits: number;
  periodMonths: number;
  concurrency: { image: number; video: number };
};
type CreemProductCatalog = {
  creditPacks: Array<CreditPackBase & { ids: ProductIds }>;
  subscriptions: Record<string, SubscriptionBase & { ids: ProductIds }>;
};

const loadExistingCatalog = async () => {
  const productsPath = PRODUCTS_PATH(env);
  if (!fs.existsSync(productsPath)) {
    return null;
  }
  const moduleUrl = `${pathToFileURL(productsPath).href}?t=${Date.now()}`;
  const mod = await import(moduleUrl);
  return (mod.creemProducts as CreemProductCatalog) || null;
};

const createCurrentIdsStore = () => ({
  subscriptions: {} as Record<string, string>,
  creditPacks: {} as Record<string, string>,
});

const syncProducts = async () => {
  const existingProducts = await listAllProducts();
  const existingByName = new Map(existingProducts.map((item) => [item.name, item.id]));
  const currentIds = createCurrentIdsStore();

  const subscriptionEntries = Object.entries(SUBSCRIPTIONS);
  for (const [planKey, plan] of subscriptionEntries) {
    const billingCycle = resolveBillingCycle(planKey);
    const name = buildSubscriptionName(plan.planType, billingCycle);
    const price = Math.round(plan.price * 100);
    const billingPeriod = BILLING_PERIOD_BY_CYCLE[billingCycle];

    console.log('[Creem] 创建/复用订阅产品:', {
      planKey,
      name,
      billingCycle,
      billingPeriod,
      price,
      currency: DEFAULT_CURRENCY,
      billingType: BILLING_TYPE_RECURRING,
    });

    const productId = await ensureProduct(
      name,
      {
        description: `${titleCase(plan.planType)} subscription (${billingLabel(billingCycle)})`,
        price,
        currency: DEFAULT_CURRENCY,
        billingType: BILLING_TYPE_RECURRING,
        billingPeriod,
        taxMode: DEFAULT_TAX_MODE,
        taxCategory: DEFAULT_TAX_CATEGORY,
      },
      existingByName
    );

    currentIds.subscriptions[planKey] = productId;
  }

  for (const pack of CREDIT_PACKS) {
    const name = buildCreditPackName(pack.name, pack.validDays);
    const price = Math.round(pack.price * 100);

    console.log('[Creem] 创建/复用积分包产品:', {
      packId: pack.id,
      name,
      price,
      currency: DEFAULT_CURRENCY,
      validDays: pack.validDays,
      billingType: BILLING_TYPE_ONETIME,
    });

    const productId = await ensureProduct(
      name,
      {
        description: `Credits pack ${titleCase(pack.name)}, valid ${buildDayLabel(pack.validDays)}`,
        price,
        currency: DEFAULT_CURRENCY,
        billingType: BILLING_TYPE_ONETIME,
        taxMode: DEFAULT_TAX_MODE,
        taxCategory: DEFAULT_TAX_CATEGORY,
      },
      existingByName
    );

    currentIds.creditPacks[pack.id] = productId;
  }

  return currentIds;
};

const buildIds = (existing: ProductIds | undefined, nextCurrent: string): ProductIds => {
  const previous = existing?.current ? [existing.current] : [];
  const mergedHistorical = [...(existing?.historical || []), ...previous].filter(Boolean);
  const uniqueHistorical = Array.from(new Set(mergedHistorical)).filter((id) => id !== nextCurrent);
  return { current: nextCurrent, historical: uniqueHistorical };
};

const writeProductsFile = async (
  currentIds: { subscriptions: Record<string, string>; creditPacks: Record<string, string> }
) => {
  const existingCatalog = await loadExistingCatalog();

  const creditPacks: CreemProductCatalog["creditPacks"] = CREDIT_PACKS.map((pack) => {
    const current = currentIds.creditPacks[pack.id] || "";
    const existing =
      existingCatalog?.creditPacks.find((item) => item.id === pack.id)?.ids || undefined;
    return { ...pack, ids: buildIds(existing, current) };
  });

  const subscriptions: CreemProductCatalog["subscriptions"] = Object.fromEntries(
    Object.entries(SUBSCRIPTIONS).map(([key, sub]) => {
      const current = currentIds.subscriptions[key] || "";
      const existing = existingCatalog?.subscriptions?.[key]?.ids || undefined;
      return [key, { ...sub, ids: buildIds(existing, current) }];
    }),
  );

  const catalog: CreemProductCatalog = { creditPacks, subscriptions };

  const targetPath = PRODUCTS_PATH(env);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const content = `export const creemProducts = ${JSON.stringify(catalog, null, 2)} as const;\n`;
  fs.writeFileSync(targetPath, content, 'utf8');
};

syncProducts()
  .then((currentIds) => {
    return writeProductsFile(currentIds).then(() => {
      console.log(`[OK] Updated ${PRODUCTS_PATH(env)} with current IDs`);
    });
  })
  .catch((error) => {
    console.error('[ERR] Failed to sync Creem products:', error);
    process.exit(1);
  });
