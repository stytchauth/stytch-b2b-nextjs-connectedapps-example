'use client'

import Image from "next/image";
import Link from "next/link";

export default function Index() {



  return (
    <div>
      <h2 className="text-center">Welcome to the Stytch Connected Apps demo!</h2>
      <div>
        <p>This demo provides an example of how a Client App interacts with a Stytch Connected App.</p>
        <p>Both roles - Connected App (serving as the IDP) and Client App (the app asking for permissions from the Connected App) are fulfilled by the same demo, so we'll try to be clear on which role is occurring at each step.</p>
        <p>For background information about Connected Apps, please refer to our <Link href="https://stytch.com/docs/b2b/guides/connected-apps/getting-started">getting started guide for Connected Apps</Link></p>
        <p>The flow this app will take advantage of is the Authorization Code Flow with PKCE. When configuring this app as a client app in Stytch, please select "Third Party Public" as the Client type; this will show how our user consent screen renders and enable PKCE for this app.</p>
        <p>
          Please begin by ensuring you're logged in in the right pane.
        </p>
        <br />
       </div>
      <br />
    </div>
  );
}
