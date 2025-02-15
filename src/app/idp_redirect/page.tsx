'use client';

import Form from 'next/form';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import crypto from 'crypto';

const IdpRedirectPage = (): JSX.Element => {

  /**
   * Initialize from local storage if present.
   */
  const [clientId, setClientId] = useState( () => {
    return localStorage.getItem("client_id");
  });
  const [redirectUri, setRedirectUri] = useState( () => {
    const url = new URL(window.location.href);
    return url.origin + url.pathname
  });

  /**
   * The code verifier is a bit different - it *must* have been used in the previous request
   * to succeed at PKCE, so if it's not present that's an error
   */
  const [codeVerifier, setCodeVerifier] = useState( () => {
    var verifier = localStorage.getItem("code_verifier")
    if (verifier === null || verifier === '') {
      console.error("No verifier stored - this was required to be set in the /begin page")
    }
    return verifier;
  });

  const [projectId, setProjectId] = useState('');
  const [successJsx, setSuccessJsx] = useState('');





  const prettyPrintPostInformation = () => {
    var u = new URL(`${process.env.NEXT_PUBLIC_TEST_API_URL}/v1/public/${projectId}/oauth2/token`)
    return <div>
        <p>{u.href}</p>
        <p>With POST data:</p>
        <ul>
          <li><code>client_id</code>: {clientId}</li>
          <li><code>redirect_uri</code>: {redirectUri}</li>
          <li><code>grant_type</code>: authorization_code</li>
          <li><code>code</code>: code</li>
          <li><code>code_verifier</code>: codeVerifier</li>
        </ul>
      </div>
  };

  const code = useSearchParams().get('code');

  const renderCodeReceived = () => {
    if (code === undefined || code === null ) {
      return <div>
        <p>Code not found in url. Did you go through the first step of the example app at <Link href="/begin">/begin?</Link></p>
      </div>
    }
    return <div>
      <p>Code is {code}</p>
    </div>
  }

  const doTokenExchange = async (e) => {
    e.preventDefault();
    setSuccessJsx(<div>
      <em>Waiting for credentials...</em>
    </div>);
    var formData = new FormData();
    formData.append('client_id', clientId);
    formData.append('redirect_uri', redirectUri);
    formData.append('code', code);
    formData.append('grant_type', 'authorization_code');
    formData.append('code_verifier', codeVerifier);

    const response = await fetch(`https://test.mbramlage.dev.stytch.com/v1/public/${projectId}/oauth2/token`, {
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
      {renderCodeReceived()}
      <Form onSubmit={doTokenExchange}>
        <label>
          <div>Stytch Client App ID</div>
          <input name="client_id"
            defaultValue={clientId}
            onChange={(e) => setClientId(e.target.value)}/>
        </label>
        <label>
          <div>Stytch Project ID</div>
          <input name="project_id"
            onChange={(e) => setProjectId(e.target.value)}/>
        </label>
        <label>
          <div>Stytch Client Redirect URI</div>
          <input name="redirect_uri"
            defaultValue={redirectUri}
            onChange={(e) => setRedirectUri(e.target.value)}/>
        </label>
        <br />
        <button type="submit">Submit</button>
      </Form>
      <h2>We will make an async POST request to:</h2>
      <div>{prettyPrintPostInformation()}</div>

      {successJsx}
    </div>
  )
};

export default IdpRedirectPage;
