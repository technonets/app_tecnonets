import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({
  subsets: ["latin"],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: "Tecnonets | Desarrollo Web y Automatización",
  description: "Transformamos tu negocio con soluciones digitales minimalistas y eficientes.",
  metadataBase: new URL('https://tecnonets.com'), // Reemplazar con el dominio real si es diferente, pero necesario para OG images
  openGraph: {
    title: "Tecnonets | Desarrollo Web y Automatización",
    description: "Transformamos tu negocio con soluciones digitales minimalistas y eficientes.",
    url: 'https://tecnonets.com',
    siteName: 'Tecnonets',
    locale: 'es_ES',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import FacebookPixel from '@/components/analytics/FacebookPixel';

import { CookieConsent } from "@/components/ui/CookieConsent";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.className} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        {/* Google AdSense - Global Integration */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Enable Auto Ads explicitly via meta if needed, though script src is usually enough */}
      </head>
      <body className="antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
        <FacebookPixel pixelId={process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID} />
        <WhatsAppButton />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
