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
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-[#0a0f1d] dark:text-slate-100 pb-20 md:pb-0">
        <CartProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <BottomNav />
        </CartProvider>
      </body>
    </html>
  );
}
