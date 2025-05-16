import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReCaptchaProvider } from 'next-recaptcha-v3';
import { Providers } from './providers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Application Followups",
  description: "Track and manage your application followups efficiently",
  keywords: ["application", "followup", "tracking", "management"],
  authors: [{ name: "Amir Ehsandar" }],
  creator: "Amir Ehsandar",
  publisher: "Amir Ehsandar",
  formatDetection: {
    email: false,
    telephone: false,
  },
  metadataBase: new URL("https://followups.ehsandar.top"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Application Followups",
    description: "Track and manage your application followups efficiently",
    url: "https://followups.ehsandar.top",
    siteName: "Application Followups",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Application Followups",
    description: "Track and manage your application followups efficiently",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon.ico", sizes: "any" }
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      { rel: "mask-icon", url: "/icons/safari-pinned-tab.svg", color: "#0070f3" }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Application Followups"
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}>
          <Providers>
            {children}
          </Providers>
        </ReCaptchaProvider>
      </body>
    </html>
  );
}
