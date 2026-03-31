import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Syneria - Plataforma Global de Talento",
    template: "%s | Syneria",
  },
  description:
    "Conectando trabajadores migrantes con empleadores internacionales. Tu talento, tu mundo, tu economia.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${syne.variable} ${dmSans.variable} font-body antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <TooltipProvider>{children}</TooltipProvider>
        </NextIntlClientProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
