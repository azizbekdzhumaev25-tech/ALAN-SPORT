import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { ShopProvider } from "@/components/ShopContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";

export const metadata: Metadata = {
  metadataBase: new URL("https://alan-sport.uz"),
  title: {
    default: "ALAN SPORT — Buxorodagi sport tovarlari do'koni",
    template: "%s — ALAN SPORT",
  },
  description:
    "Buxorodagi eng keng assortimentli sport do'koni: krossovkalar, sport kiyimlari, anjomlar va aksessuarlar. Sifatli va hamyonbop sport tovarlari. Har kuni 09:00–23:00.",
  icons: { icon: "/images/logo.png" },
  openGraph: {
    title: "ALAN SPORT — Buxorodagi sport tovarlari do'koni",
    description:
      "Krossovkalar, sport kiyimlari, anjomlar va aksessuarlar — sifatli va hamyonbop. Buxoro shahri, Xafiz Tanish Buxori ko'chasi, 10.",
    siteName: "ALAN SPORT",
    locale: "uz_UZ",
    type: "website",
    images: [{ url: "/images/hero.jpg", width: 1536, height: 640, alt: "ALAN SPORT" }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz" data-scroll-behavior="smooth">
      <body className="font-body text-white antialiased">
        <Preloader />
        <link rel="preconnect" href="https://images.pexels.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[110] focus:bg-gold focus:px-4 focus:py-2 focus:text-coal"
        >
          Asosiy kontentga o'tish
        </a>
        <ToastProvider>
          <ShopProvider>
            <Header />
            <main id="content" className="min-h-[60vh]">
              {children}
            </main>
            <Footer />
          </ShopProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
