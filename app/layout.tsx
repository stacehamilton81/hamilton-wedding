import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

// Initialize Figtree
const figtree = Figtree({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Hamilton Wedding",
  description: "Share your photos with us!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${figtree.className} antialiased min-h-screen bg-black`}>
        {children}
      </body>
    </html>
  );
}