import "./globals.css";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { getLocale } from "next-intl/server";
import { rtlLocales } from "@i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const dir = rtlLocales.includes(locale as any) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className="dark"
      suppressHydrationWarning
      translate="no"
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
