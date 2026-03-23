import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wingsacademy.info"),
  title: {
    default: "Wings Academy | Premium AME Mock Test Platform",
    template: "%s | Wings Academy"
  },
  description: "Wings Academy is the world's most accurate and up-to-date mock test platform for Aircraft Maintenance Engineers (AME). Prepare for EASA, DGCA, and GCAA exams with professional mock tests.",
  keywords: ["AME", "Aircraft Maintenance Engineer", "EASA Part 66", "DGCA Exams", "GCAA Exams", "Mock Tests", "Aviation Engineering"],
  authors: [{ name: "Wings Academy" }],
  creator: "Wings Academy",
  publisher: "Wings Academy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wingsacademy.info",
    siteName: "Wings Academy",
    title: "Wings Academy | Premium AME Mock Test Platform",
    description: "The world's most accurate and up-to-date mock test platform for Aircraft Maintenance Engineers. Prepare for your certification exams with confidence.",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Wings Academy Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wings Academy | Premium AME Mock Test Platform",
    description: "The world's most accurate and up-to-date mock test platform for Aircraft Maintenance Engineers.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
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
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
