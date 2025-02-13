'use client'

import type { Metadata } from "next";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google";
import StytchProvider from '../components/StytchProvider';
import { useStytchB2BClient, useStytchMemberSession } from '@stytch/nextjs/b2b';
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
          <div className="page">
            <main className="content-container">{children}</main>
          </div>
          <footer>
            <Logout />
            <Home />
          </footer>
        </body>
      </html>
    </StytchProvider>
  );
}

const Logout = () => {

  const router = useRouter();
  const stytch = useStytchB2BClient();
  const { session } = useStytchMemberSession();

  const handleLogOut = () => {
    if (session) {
      stytch.session.revoke().then(() => {
        router.replace('/');
      });
    }
  };

  var logoutJsx;
  if (session) {
    logoutJsx = <div className="logout-link" onClick={handleLogOut}>
      Log out
    </div>
  } else {
    logoutJsx = <div />
  }

  return (
    <div>
      {logoutJsx}
    </div>
  )
}

const Home = () => {
  return (
    <div>
      <Link href="/">Return to home</Link>
    </div>
  )
}
