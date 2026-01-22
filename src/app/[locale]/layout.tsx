import type { Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@i18n/routing";
import { AppLayoutClient } from "@/components/layout/AppLayoutClient";
import { UserProvider } from "@/components/providers/UserProvider";
import { UserStoreProvider } from "@/components/providers/UserStoreProvider";
import { ModalProvider } from "@/components/providers/ModalProvider";
import { ThemeProvider } from "@extensions/theme/core/ThemeProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const messages = await getMessages({
    locale,
  });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <UserProvider>
          <UserStoreProvider>
            <AppLayoutClient>{children}</AppLayoutClient>
            <ModalProvider />
          </UserStoreProvider>
        </UserProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
