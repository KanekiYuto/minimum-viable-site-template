"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { siteConfig } from "@/config/site";
import { useTranslations } from "next-intl";

/**
 * 支付方式配置
 */
const paymentMethods = [
  { id: "visa", name: "Visa", image: "/payment-icons/visa.png", scale: 1.5 },
  { id: "mastercard", name: "Mastercard", image: "/payment-icons/mastercard.png", scale: 1.5 },
  { id: "amex", name: "American Express", image: "/payment-icons/amex.png", scale: 1.1 },
  { id: "link", name: "Link by Stripe", image: "/payment-icons/link.png", scale: 1.1 },
  { id: "googlepay", name: "Google Pay", image: "/payment-icons/googlepay.png", scale: 1.5 },
  { id: "applepay", name: "Apple Pay", image: "/payment-icons/applepay.png", scale: 1.5 },
];

/**
 * 支付方式图标组件
 * 展示 Stripe 支持的主要支付方式
 */
export function PaymentIcons() {
  const t = useTranslations("pricing.payment");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="text-center"
    >
      {/* 安全提示文字 */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">{t("securePayment")}</p>
      </div>

      {/* 支付方式图标 */}
      <TooltipProvider>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {paymentMethods.map((method) => (
            <Tooltip key={method.id}>
              <TooltipTrigger asChild>
                <div className="w-24 h-[72px] rounded-lg overflow-hidden border border-border cursor-pointer hover:border-border/80 transition-colors">
                  <Image
                    src={method.image}
                    alt={method.name}
                    width={96}
                    height={72}
                    className="w-full h-full object-cover"
                    style={{ transform: `scale(${method.scale})` }}
                    unoptimized
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{method.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* 没有找到支付方式提示 */}
      <div className="mt-6">
        <p className="text-muted-foreground text-sm">
          {t("noPaymentMethod")}
          <a
            href={`mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(t("emailSubject"))}`}
            className="ml-2 text-primary hover:text-primary-hover underline transition-colors"
          >
            {t("contactUs")}
          </a>
        </p>
      </div>
    </motion.div>
  );
}
