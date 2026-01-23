'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  getCreditPackByProductId,
  getSubscriptionPlanByProductId,
} from '@/shared/payment/config/payment';

// 声明 gtag 函数类型
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: Record<string, unknown>) => void;
  }
}

export default function SubscriptionSuccessClient() {
  const t = useTranslations('subscription-success');
  const tPlans = useTranslations('common.plans');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10000);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // 从 URL 参数获取订阅/Checkout ID
  const productId = searchParams.get('p_id');
  const paymentType = searchParams.get('type');
  
  const isOneTime = paymentType === 'one-time';
  const isSubscription = paymentType === 'sub';
  const productCreditPack = productId ? getCreditPackByProductId(productId) : null;
  const subscriptionPlan = productId ? getSubscriptionPlanByProductId(productId) : null;

  const { subscriptionData, creditPackData } = useMemo(() => {
    if (!productId) {
      return { subscriptionData: null, creditPackData: null };
    }

    if (isOneTime) {
      return {
        subscriptionData: null,
        creditPackData: productCreditPack
          ? {
              paymentTransactionId: 'config',
              amount: Math.round(productCreditPack.price * 100),
              currency: 'USD',
              credits: productCreditPack.credits,
              creditPackId: productCreditPack.id,
              expiresAt: null,
            }
          : null,
      };
    }

    if (isSubscription) {
      return {
        subscriptionData: subscriptionPlan
          ? {
              id: subscriptionPlan.subscriptionPlanType,
              planType: subscriptionPlan.planType,
              amount: Math.round(subscriptionPlan.price * 100),
              currency: 'USD',
              status: 'active',
              startedAt: null,
              expiresAt: null,
              paymentTransactionId: null,
            }
          : null,
        creditPackData: null,
      };
    }

    if (subscriptionPlan && !productCreditPack) {
      return {
        subscriptionData: {
          id: subscriptionPlan.subscriptionPlanType,
          planType: subscriptionPlan.planType,
          amount: Math.round(subscriptionPlan.price * 100),
          currency: 'USD',
          status: 'active',
          startedAt: null,
          expiresAt: null,
          paymentTransactionId: null,
        },
        creditPackData: null,
      };
    }

    if (productCreditPack) {
      return {
        subscriptionData: null,
        creditPackData: {
          paymentTransactionId: 'config',
          amount: Math.round(productCreditPack.price * 100),
          currency: 'USD',
          credits: productCreditPack.credits,
          creditPackId: productCreditPack.id,
          expiresAt: null,
        },
      };
    }

    return { subscriptionData: null, creditPackData: null };
  }, [productId, isOneTime, isSubscription, productCreditPack, subscriptionPlan]);

  const isCreditPackFlow =
    isOneTime || Boolean(productCreditPack) || (!subscriptionPlan && Boolean(productId));

  // 跳转到积分页面
  const handleRedirect = useCallback(() => {
    setIsRedirecting(true);
    router.push('/settings/credits');
  }, [router]);

  // 倒计时自动跳转
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleRedirect]);

  // 如果没有任何数据，显示错误
  if (!subscriptionData && !creditPackData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Card className="border-border bg-bg-elevated w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-white/60 mb-4">
              {isCreditPackFlow ? t('creditNotFound') : t('notFound')}
            </p>
            <Button
              onClick={() => router.push(isCreditPackFlow ? '/settings/home' : '/settings/billing')}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              {isCreditPackFlow ? t('actions.viewCredits') : t('actions.viewSubscription')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md md:max-w-lg">
        {/* 成功图标和标题 */}
        <div className="text-center mb-6 md:mb-10 animate-in fade-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full mb-4 md:mb-5 bg-primary/10">
            <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {creditPackData ? t('creditPackTitle') : t('title')}
          </h1>
          <p className="text-sm md:text-base text-white/60">
            {creditPackData ? t('creditPackDescription') : t('description')}
          </p>
        </div>

        {/* 订阅/积分信息卡片 */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm mb-5 md:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <CardContent className="pt-5 md:pt-7">
            <div className="space-y-4 md:space-y-5">
              {creditPackData ? (
                <>
                  <div>
                    <div className="text-xs md:text-sm text-white/50 mb-1 md:mb-1.5">
                      {t('details.credits')}
                    </div>
                    <div className="text-sm md:text-base text-white font-medium">
                      {creditPackData.credits}
                    </div>
                  </div>

                  <div className="border-t border-white/10" />
                  <div>
                    <div className="text-xs md:text-sm text-white/50 mb-1 md:mb-1.5">
                      {t('details.amount')}
                    </div>
                    <div className="text-sm md:text-base text-white font-medium">
                      {creditPackData.currency === 'CNY' ? '¥' : '$'}
                      {(creditPackData.amount / 100).toFixed(2)}
                    </div>
                  </div>

                  <div className="border-t border-white/10" />
                  <div>
                    <div className="text-xs md:text-sm text-white/50 mb-1 md:mb-1.5">
                      {t('details.status')}
                    </div>
                    <div className="inline-flex items-center gap-1.5 md:gap-2">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary" />
                      <span className="text-sm md:text-base font-medium text-primary">
                        {t('details.statusCompleted')}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="text-xs md:text-sm text-white/50 mb-1 md:mb-1.5">{t('details.plan')}</div>
                    <div className="text-sm md:text-base text-white font-medium">
                      {tPlans(subscriptionData?.planType ?? 'unknown', {
                        defaultValue: subscriptionData?.planType ?? 'unknown',
                      })}
                    </div>
                  </div>

                  <div className="border-t border-white/10" />
                  <div>
                    <div className="text-xs md:text-sm text-white/50 mb-1 md:mb-1.5">{t('details.amount')}</div>
                    <div className="text-sm md:text-base text-white font-medium">
                      {subscriptionData?.currency === 'CNY' ? '¥' : '$'}
                      {((subscriptionData?.amount || 0) / 100).toFixed(2)}
                    </div>
                  </div>

                  <div className="border-t border-white/10" />
                  <div>
                    <div className="text-xs md:text-sm text-white/50 mb-1 md:mb-1.5">{t('details.status')}</div>
                    <div className="inline-flex items-center gap-1.5 md:gap-2">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary" />
                      <span className="text-sm md:text-base font-medium text-primary">
                        {t('details.statusActive')}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 下一步 */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm mb-5 md:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <CardContent className="pt-4 md:pt-6">
            <h3 className="text-sm md:text-base font-medium text-white mb-3 md:mb-4">{t('nextSteps.title')}</h3>
            <ul className="space-y-2.5 md:space-y-3">
              <li className="flex items-start gap-2.5 md:gap-3 text-sm md:text-base text-white/70">
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full mt-1.5 md:mt-2 flex-shrink-0 bg-primary" />
                <span>{creditPackData ? t('nextSteps.creditStep1') : t('nextSteps.step1')}</span>
              </li>
              <li className="flex items-start gap-2.5 md:gap-3 text-sm md:text-base text-white/70">
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full mt-1.5 md:mt-2 flex-shrink-0 bg-primary" />
                <span>{creditPackData ? t('nextSteps.creditStep2') : t('nextSteps.step2')}</span>
              </li>
              <li className="flex items-start gap-2.5 md:gap-3 text-sm md:text-base text-white/70">
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full mt-1.5 md:mt-2 flex-shrink-0 bg-primary" />
                <span>{creditPackData ? t('nextSteps.creditStep3') : t('nextSteps.step3')}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <Button
            onClick={handleRedirect}
            disabled={isRedirecting}
            className="w-full text-white border-0 h-11 md:h-12 text-sm md:text-base font-medium transition-all duration-200 bg-primary hover:bg-primary/90"
          >
            {isRedirecting ? (
              <>
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                {t('actions.redirecting')}
              </>
            ) : (
              <>
                {t('actions.startUsing')}
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              </>
            )}
          </Button>

          <Button
            onClick={() => router.push(creditPackData ? '/settings/home' : '/settings/billing')}
            disabled={isRedirecting}
            variant="ghost"
            className="w-full text-white/70 hover:text-white hover:bg-white/5 h-11 md:h-12 text-sm md:text-base"
          >
            {creditPackData ? t('actions.viewCredits') : t('actions.viewSubscription')}
          </Button>
        </div>

        {/* 倒计时 */}
        {countdown > 0 && (
          <p className="text-center text-white/40 text-xs md:text-sm mt-5 md:mt-6 animate-in fade-in duration-500 delay-400">
            {t('autoRedirect', { seconds: countdown })}
          </p>
        )}
      </div>
    </div>
  );
}
