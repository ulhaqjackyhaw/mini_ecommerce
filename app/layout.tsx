import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuickOrder — Mini E-Commerce",
  description: "Pesan produk cepat tanpa login, invoice instan, dan pelacakan pesanan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 pb-16 md:pb-0">
        <CartProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
          <BottomNav />
        </CartProvider>
      </body>
    </html>
  );
}
