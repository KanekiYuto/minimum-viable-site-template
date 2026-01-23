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

/**
 * 支付方式图标项（由外部注入）。
 *
 * - `image` 通常为 public 下的静态资源路径
 * - `scale` 用于兼容不同图标的视觉大小
 */
export type PaymentIconMethod = {
  id: string;
  name: string;
  image: string;
  scale?: number;
};

/**
 * PaymentIcons 组件所需文案（由外部注入）。
 *
 * 注意：组件内不做国际化。
 */
export type PaymentIconsLabels = {
  securePayment: string;
  noPaymentMethod: string;
  contactUs: string;
  emailSubject: string;
};

interface PaymentIconsProps {
  /** 支付方式图标列表 */
  methods: PaymentIconMethod[];
  /** 支持邮箱（用于 mailto 链接，可选） */
  supportEmail?: string;
  /** 文案 */
  labels: PaymentIconsLabels;
}

/**
 * 支付方式展示（带 tooltip）。
 */
export function PaymentIcons({ methods, supportEmail, labels }: PaymentIconsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="flex items-center justify-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">{labels.securePayment}</p>
      </div>

      <TooltipProvider>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {methods.map((method) => (
            <Tooltip key={method.id}>
              <TooltipTrigger asChild>
                <div className="w-24 h-[72px] rounded-lg overflow-hidden border border-border cursor-pointer hover:border-border/80 transition-colors">
                  <Image
                    src={method.image}
                    alt={method.name}
                    width={96}
                    height={72}
                    className="w-full h-full object-cover"
                    style={{
                      transform:
                        typeof method.scale === "number"
                          ? `scale(${method.scale})`
                          : undefined,
                    }}
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

      <div className="mt-6">
        <p className="text-muted-foreground text-sm">
          {labels.noPaymentMethod}
          {supportEmail ? (
            <a
              href={`mailto:${supportEmail}?subject=${encodeURIComponent(
                labels.emailSubject
              )}`}
              className="ml-2 text-primary hover:text-primary-hover underline transition-colors"
            >
              {labels.contactUs}
            </a>
          ) : null}
        </p>
      </div>
    </motion.div>
  );
}
