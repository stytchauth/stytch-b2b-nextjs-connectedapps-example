'use client'

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import StytchProvider from '../components/StytchProvider';
import "./globals.css";

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
    <StytchProvider>
      <html lang="en">
        <title>Stytch Next.js Connected Apps Example</title>
        <meta
          name="description"
          content="A Stytch Connected Apps example"
        />
        <body>
          <div className="page-container">
            <main className="content-container">{children}</main>
          </div>
        </body>
      </html>
    </StytchProvider>
  );
}
