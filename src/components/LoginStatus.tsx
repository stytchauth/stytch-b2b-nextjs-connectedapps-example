'use client';

import React from 'react';
import { useStytchMemberSession } from '@stytch/nextjs/b2b';
import Login from '@/components/Login';
import Link from "next/link";

/*
 * Login configures and renders the StytchLogin component which is a prebuilt UI component for auth powered by Stytch.
 *
 * This component accepts style, config, and callbacks props. To learn more about possible options review the documentation at
 * https://stytch.com/docs/b2b/sdks/ui-config
 */

const LoginStatus = () => {


  const { session, isInitialized } = useStytchMemberSession();

  var loginStatus;
  if (isInitialized && session) {
    loginStatus = <div>
      <div>Logged in!</div>
      <div>To begin the flow, please click <Link href="/begin">this link</Link></div>
    </div>
  } else {
    loginStatus = <div>
      Not logged in. Please log in first.
      <Login />
    </div>
  }

  return (
    <div className="centered">
      {loginStatus}
    </div>
  );
};

export default LoginStatus;
