"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { Link } from "@i18n/routing";
import type { ComponentType } from "react";

export type FooterLink = {
  label: string;
  href: string;
};

export type FooterSection = {
  title: string;
  links: FooterLink[];
};

export type SocialLink = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

interface FooterProps {
  className?: string;
  brandName: string;
  fullName: string;
  copyright: {
    year: number;
    text: string;
  };
  sections: FooterSection[];
  socialLinks: SocialLink[];
}

export function Footer({
  className,
  brandName,
  fullName,
  copyright,
  sections,
  socialLinks,
}: FooterProps) {
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
        {/* 导航链接 */}
        <motion.div
          variants={fadeInUp}
          className="mb-12 grid grid-cols-2 gap-6 md:mb-16 md:grid-cols-3 md:gap-8 lg:mb-20 lg:grid-cols-7"
        >
          {sections.map((section: FooterSection) => (
            <div key={section.title}>
              <div className="font-medium text-muted-foreground text-xs md:text-sm mb-3 md:mb-4">
                {section.title}
              </div>
              <ul className="space-y-2 md:space-y-3">
                {section.links.map((link: FooterLink) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-foreground text-xs md:text-sm transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* 品牌大标题 */}
        <motion.div
          variants={fadeInUp}
          className="relative overflow-hidden py-8 md:py-12 lg:py-16 xl:py-20"
        >
          <div className="text-[4rem] sm:text-[6rem] md:text-[10rem] lg:text-[14rem] xl:text-[18rem] font-bold text-foreground/8 leading-none tracking-tighter text-center select-none">
            {brandName}
          </div>
        </motion.div>

        {/* 底部信息栏 */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 pt-6 md:pt-8"
        >
          <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
            © {copyright.year} {fullName}. {copyright.text}
          </p>

          {/* 社交链接 */}
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
