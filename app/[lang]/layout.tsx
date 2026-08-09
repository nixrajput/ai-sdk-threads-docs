import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { i18n, localeNames } from "@/lib/i18n";
import { SITE_DESCRIPTION, SITE_TAGLINE, SITE_URL } from "@/lib/shared";
import "../global.css";

// Body text uses Tailwind's default system-font stack (no download, no
// identity to earn); only the two fonts with a real visual job stay.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `mcp-vitest - ${SITE_TAGLINE}`, template: "%s - mcp-vitest" },
  description: SITE_DESCRIPTION,
  openGraph: { type: "website", url: SITE_URL, siteName: "mcp-vitest" },
};

export default async function Layout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;

  return (
    <html
      lang={lang}
      className={`${bricolage.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <RootProvider
          i18n={{
            locale: lang,
            locales: i18n.languages.map((locale) => ({ locale, name: localeNames[locale] })),
          }}
        >
          {children}
        </RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
