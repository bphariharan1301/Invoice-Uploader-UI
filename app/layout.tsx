import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
// @ts-ignore: CSS module without type declarations
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";
import { ReduxProvider } from "@/lib/store/provider";
import GlobalAlert from "@/components/GlobalAlert";

const inter = Inter({ subsets: ["latin"] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Invoice Uploader",
  description: "Upload, review and manage invoices with ease",
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
        <ReduxProvider>
          <ThemeRegistry>
            <GlobalAlert />
            {children}
          </ThemeRegistry>
        </ReduxProvider>
      </body>
    </html>
  );
}
