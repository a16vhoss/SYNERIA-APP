import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syneria - Plataforma Global de Talento",
  description:
    "Conectando trabajadores migrantes con empleadores internacionales. Tu talento, tu mundo, tu economia.",
  openGraph: {
    title: "Syneria - Plataforma Global de Talento",
    description:
      "Conectando trabajadores migrantes con empleadores internacionales. Tu talento, tu mundo, tu economia.",
    url: "https://syneria.app",
    siteName: "Syneria",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Syneria - Plataforma Global de Talento",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Syneria - Plataforma Global de Talento",
    description:
      "Conectando trabajadores migrantes con empleadores internacionales.",
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="scroll-smooth">{children}</div>;
}
