import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Francilienne Energy – Distributeur B2B Énergie Renouvelable",
    template: "%s | Francilienne Energy",
  },
  description:
    "Distributeur professionnel de panneaux solaires, onduleurs, pompes à chaleur et solutions de stockage pour installateurs et bureaux d'études. Enphase, Hoymiles, Huawei, Panasonic.",
  keywords: [
    "panneaux solaires",
    "photovoltaïque",
    "onduleur",
    "micro-onduleur",
    "pompe à chaleur",
    "PAC",
    "stockage énergie",
    "distributeur B2B",
    "Enphase",
    "Hoymiles",
    "Huawei",
    "installateur",
  ],
  authors: [{ name: "Francilienne Energy" }],
  creator: "Francilienne Energy",
  publisher: "Francilienne Energy",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://francilienne-energy.fr"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Francilienne Energy",
    title: "Francilienne Energy – Distributeur B2B Énergie Renouvelable",
    description: "Distributeur professionnel de panneaux solaires, onduleurs, pompes à chaleur pour installateurs.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Francilienne Energy – Distributeur B2B Énergie",
    description: "Distributeur professionnel de panneaux solaires, pompes à chaleur pour installateurs.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`} data-scroll-behavior="smooth">
      <body className="antialiased flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
