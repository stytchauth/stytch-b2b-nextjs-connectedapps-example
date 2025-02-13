'use client';

import Form from 'next/form';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import crypto from 'crypto';

const IdpRedirectPage = (): JSX.Element => {

  const [clientId, setClientId] = useState('');
  const [redirectUri, setRedirectUri] = useState('http://localhost:3000/idp_redirect');
  const [projectId, setProjectId] = useState('');


  const [codeVerifier, setCodeVerifier] = useState( () => {
    var verifier = localStorage.getItem("code_verifier")
    if (verifier === null || verifier === '') {
      console.error("No verifier stored - this was required to be set in the /begin page")
    }
    return verifier;
  });

  const code = useSearchParams().get('code');

  const generateUrlString = () => {
    var u = new URL(`https://test.mbramlage.dev.stytch.com/v1/public/${projectId}/oauth2/token`)
    u.searchParams.append("client_id", clientId)
    u.searchParams.append("redirect_uri", redirectUri)
    u.searchParams.append("code", code)
    u.searchParams.append("grant_type", "authorization_code")
    u.searchParams.append("code_verifier", codeVerifier);
    return u.href;
  };

  const renderCodeReceived = () => {
    if (code === undefined ) {
      return <div>
        <p>Code not found in url :( did you go through the first step of the example app at /begin?</p>
      </div>
    }
    return <div>
      <p>Code is {code}</p>
    </div>
  }

  const doTokenExchange = async (e) => {
    e.preventDefault();
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
      <p>{generateUrlString()}</p>
    </div>
  )
};

export default IdpRedirectPage;
