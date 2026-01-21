"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Link } from '@i18n/routing';
import { useTranslations } from 'next-intl';

interface FooterProps {
  className?: string;
}

// SVG 图标组件
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
  >
    <title>Discord</title>
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
);

const socialLinks = [
  { icon: DiscordIcon, href: siteConfig.social.discord, label: "Discord" },
];

export function Footer({ className }: FooterProps) {
  const tSections = useTranslations('footer.sections');
  const tLinks = useTranslations('footer.links');

  // 链接标签翻译映射
  const translateLabel = (label: string): string => {
    const labelMap: Record<string, string> = {
      'Seedream 4.5': tLinks('seedream45'),
      'AI Hairstyle Changer': tLinks('aiHairstyleChanger'),
      'AI Hair Color Changer': tLinks('aiHairColorChanger'),
      'Pricing': tLinks('pricing'),
      'Help Center': tLinks('helpCenter'),
      'Discord': tLinks('discord'),
      'Email': tLinks('email'),
      'Privacy Policy': tLinks('privacyPolicy'),
      'Terms of Service': tLinks('termsOfService'),
      'Refund Policy': tLinks('refundPolicy'),
    };
    return labelMap[label] || label;
  };

  const footerLinks = {
    models: {
      title: tSections('models'),
      links: siteConfig.links.models,
    },
    apps: {
      title: tSections('apps'),
      links: siteConfig.links.apps,
    },
    resources: {
      title: tSections('resources'),
      links: siteConfig.links.resources,
    },
    community: {
      title: tSections('community'),
      links: siteConfig.links.community,
    },
    contact: {
      title: tSections('contact'),
      links: siteConfig.links.contact,
    },
    legal: {
      title: tSections('legal'),
      links: siteConfig.links.legal,
    },
  };

  return (
    <motion.footer
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      className={cn(
        "bg-background-1 relative rounded-t-3xl",
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-8 py-12">
        {/* Navigation Links */}
        <motion.div
          variants={fadeInUp}
          className="mb-12 grid grid-cols-2 gap-6 md:mb-16 md:grid-cols-3 md:gap-8 lg:mb-20 lg:grid-cols-7"
        >
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <div className="font-medium text-muted-foreground text-xs md:text-sm mb-3 md:mb-4">
                {section.title}
              </div>
              <ul className="space-y-2 md:space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-foreground text-xs md:text-sm transition-colors hover:text-primary"
                    >
                      {translateLabel(link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Large Brand Name */}
        <motion.div
          variants={fadeInUp}
          className="relative overflow-hidden py-8 md:py-12 lg:py-16 xl:py-20"
        >
          <div className="text-[4rem] sm:text-[6rem] md:text-[10rem] lg:text-[14rem] xl:text-[18rem] font-bold text-foreground/8 leading-none tracking-tighter text-center select-none">
            {siteConfig.name}
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 pt-6 md:pt-8"
        >
          <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
            © {siteConfig.copyright.year} {siteConfig.fullName}. {siteConfig.copyright.text}
          </p>

          {/* Social Links */}
          <div className="flex gap-3 md:gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary"
                  aria-label={social.label}
                >
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                </a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}
