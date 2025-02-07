'use client'
import { useStytchMemberSession } from '@stytch/nextjs/b2b';
import Login from '@/components/Login';

import Image from "next/image";
import Link from "next/link";

export default function Index() {

  const { session, isInitialized } = useStytchMemberSession();

  var loginStatus;
  if (isInitialized && session) {
    loginStatus = <div>
      <div>Logged in!</div>
      <div>When you're ready to begin, please click <Link href="/begin">this link</Link></div>
    </div>
  } else {
    loginStatus = <div>
      Not logged in. Please log in first.
      <Login />
    </div>
  }

  return (
    <div>
      <h2 className="text-center">Welcome to the Stytch Connected Apps demo!</h2>
      <div>
        <p>In this demo we will use Stytch to implement 2 authorization flows that work in tandem:</p>
        <ol>
          <li>To act as an app that is requesting the user identity information, the Relying Party.</li>
          <li>To act as the app supplying the user identity information, the Identity Provider.</li>
        </ol>
        <br />
        {loginStatus}
       </div>
      <br />
      <div className="columns-2">
      </div>
    </div>
  );
}
