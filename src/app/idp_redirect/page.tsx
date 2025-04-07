'use client';

import Form from 'next/form';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';

const IdpRedirectPage = (): JSX.Element => {

  /**
   * Initialize these parameters from local storage or print an error.
   * These should all either be in local storage or set in the .env.local file, so there is no additional
   * input data for this page - it's just a follow-up request in public / PKCE apps.
   */

  const clientId = useMemo(() => {
    var clientId = localStorage.getItem("client_id");
    if (!clientId) {
      return <span className="invalid">
        Failed to get <code>client_id</code> from local storage. Did you start at <Link href="/begin">the /begin page</Link>?
      </span>
    }
    return clientId
  }, []);

  const projectId = useMemo(() => {
    var projectId = process.env.NEXT_PUBLIC_STYTCH_PROJECT_ID;
    if (!projectId) {
      return <span className="invalid">
        Failed to get <code>project_id</code>; this is expected to be set in the <code>.env.local</code> file in the root of this repo. Please check there.
      </span>
    }
    return projectId;
  }, []);

  const redirectURI = useMemo(() => {
    var redirectURI = localStorage.getItem("redirect_uri");
    if (!redirectURI) {
      return <span className="invalid">
        Failed to get <code>redirect_uri</code> from local storage. Did you start at <Link href="/begin">the /begin page</Link>?
      </span>
    }
    return redirectURI
  }, []);

  const codeVerifier = useMemo(() => {
    var codeVerifier = localStorage.getItem("code_verifier");
    if (!codeVerifier) {
      return <span className="invalid">
        Failed to get <code>code_verifier</code> from local storage. Did you start at <Link href="/begin">the /begin page</Link>?
      </span>
    }
    return codeVerifier
  }, []);


  const code = useSearchParams().get('code');
  const codeInUri = useMemo(() => {
    if (!code) {
      return <span className="invalid">
        Code not found in url. Did you start at <Link href="/begin">the /begin page</Link>?
      </span>
    }
    return code
  }, []);



  const prettyPrintPostInformation = () => {
    var u = new URL(`${process.env.NEXT_PUBLIC_TEST_API_URL}/v1/public/${projectId}/oauth2/token`)
    return <div>
        <p>{u.href}</p>
        <p>With POST data:</p>
        <ul>
          <li><code>client_id</code>: {clientId}</li>
          <li><code>redirect_uri</code>: {redirectURI}</li>
          <li><code>grant_type</code>: authorization_code</li>
          <li><code>code</code>: {code}</li>
          <li><code>code_verifier</code>: {codeVerifier}</li>
        </ul>
      </div>
  };


  const [successJsx, setSuccessJsx] = useState('');

  const doTokenExchange = async (e) => {
    e.preventDefault();
    setSuccessJsx(<div>
      <em>Waiting for credentials...</em>
    </div>);
    var formData = new FormData();
    formData.append('client_id', clientId);
    formData.append('redirect_uri', redirectURI);
    formData.append('code', code);
    formData.append('grant_type', 'authorization_code');
    formData.append('code_verifier', codeVerifier);

    const response = await fetch(`${process.env.NEXT_PUBLIC_TEST_API_URL}/v1/public/${projectId}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(formData)
    });

    const responseData = await response.json();
    setSuccessJsx(<div>
      <strong className="font-bold">Request complete!</strong>
      <p>Status: {response.status == 200 ? "Success!" : "Failure!"} (response code {response.status})</p>
      <p>Credentials:</p>
      <pre>
      {JSON.stringify(responseData, null, 2)}
      </pre>
    </div>);
    console.log(responseData);
  }

  return (
    <div>
      <h1>Redirect target page</h1>
      <div>Code returned from the first step (in this page's URL):</div>
      <code>{codeInUri}</code>
      <br />
      <div>Stytch Client App ID (saved from the /begin page)</div>
      <code>{clientId}</code>
      <div>Stytch Project ID (set in the .env.local file as NEXT_PUBLIC_STYTCH_PROJECT_ID)</div>
      <code>{projectId}</code>
      <div>Stytch Client Redirect URI (saved from the /begin page)</div>
      <code>{redirectURI}</code>
      <br />
      <h2>We will make an async POST request to:</h2>
      <div>{prettyPrintPostInformation()}</div>

      <Form onSubmit={doTokenExchange}>
        <button type="submit">Submit</button>
      </Form>
      {successJsx}
    </div>
  )
};

export default IdpRedirectPage;
