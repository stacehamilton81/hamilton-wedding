import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Combined and cleaned up metadata
export const metadata: Metadata = {
  title: "Hamilton Wedding",
  description: "Share your photos with us!",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hamilton Wedding",
  },
  formatDetection: {
    telephone: false,
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full min-h-screen bg-white`}
      >
        {children}
      </body>
    </html>
  );
}