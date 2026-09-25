import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const sans = IBM_Plex_Sans({
  variable: "--font-sans-loaded",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono-loaded",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://himat.tech/free-tools/json-to-typescript-zod-converter";

export const metadata: Metadata = {
  title: "JSON to TypeScript & Zod Converter | Free Developer Tool",
  description:
    "Convert JSON to TypeScript interfaces, type aliases and Zod validation schemas instantly. Free, browser-local and privacy-first. By HiMat Technology.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "JSON to TypeScript & Zod Converter | Free Developer Tool",
    description:
      "Convert JSON to TypeScript interfaces, type aliases and Zod validation schemas instantly. Free, browser-local and privacy-first.",
    type: "website",
    url: siteUrl,
    siteName: "HiMat Technology",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to TypeScript & Zod Converter | Free Developer Tool",
    description:
      "Convert JSON to TypeScript interfaces, type aliases and Zod validation schemas instantly. Free, browser-local and privacy-first.",
  },
  keywords: [
    "JSON to TypeScript",
    "JSON to Zod",
    "TypeScript interface generator",
    "Zod schema generator",
    "browser-local converter",
    "HiMat Technology",
  ],
  robots: {
    index: true,
    follow: true,
  },
  authors: [{ name: "HiMat Technology", url: "https://himat.co.in" }],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "JSON to TypeScript & Zod Converter",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Convert JSON to TypeScript interfaces, type aliases and Zod validation schemas instantly. Free, browser-local and privacy-first.",
  url: siteUrl,
  creator: {
    "@type": "Organization",
    name: "HiMat Technology",
    url: "https://himat.co.in",
    email: "info@himat.co.in",
    telephone: "+91-94452-34023",
    sameAs: [
      "https://www.facebook.com/people/Himat-technology/61593829197445/",
      "https://www.linkedin.com/company/himat-technology",
      "https://www.instagram.com/himat_technology",
      "https://himat.co.in",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
