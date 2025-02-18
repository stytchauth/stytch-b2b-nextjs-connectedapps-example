'use client'

import type { Metadata } from "next";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google";
import StytchProvider from '../components/StytchProvider';
import { useStytchB2BClient, useStytchMemberSession } from '@stytch/nextjs/b2b';
import "./globals.css";
import LoginStatus from "../components/LoginStatus";

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
        <head>
          <title>Stytch Next.js Connected Apps Example</title>
          <meta
            name="description"
            content="A Stytch Connected Apps example"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body className="grid grid-cols-8 grid-rows-1 font-display bg-stytch-white text-stytch-black ">
          <div className="page col-span-6 col-start-2">
            <main className="content-container">{children}</main>
            <hr />
            <footer className="col-span-6 col-start-2">
              <LoginStatus />
              <Logout />
              <Home />
            </footer>
          </div>
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
    logoutJsx = <Link className="logout-link" href="/" onClick={handleLogOut}>
      Log out
    </Link>
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
