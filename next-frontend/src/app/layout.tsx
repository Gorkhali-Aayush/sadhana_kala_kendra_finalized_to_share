
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LayoutContent } from "./layout-content";

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
    default: "Sadhana Kala Kendra - Classical Arts & Culture",
    template: "%s | Sadhana Kala Kendra",
  },
  description: "Discover classical music, dance, and cultural arts at Sadhana Kala Kendra. Learn from expert instructors in Indian classical traditions.",
  keywords: "classical music, dance, cultural arts, Indian classical traditions, music lessons, dance courses",
  openGraph: {
    title: "Sadhana Kala Kendra - Classical Arts & Culture",
    description: "Discover classical music, dance, and cultural arts at Sadhana Kala Kendra. Learn from expert instructors in Indian classical traditions.",
    type: "website",
    url: "https://www.sadhanakalakendra.com",
    siteName: "Sadhana Kala Kendra",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sadhana Kala Kendra - Classical Arts & Culture",
    description: "Discover classical music, dance, and cultural arts at Sadhana Kala Kendra. Learn from expert instructors in Indian classical traditions.",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
