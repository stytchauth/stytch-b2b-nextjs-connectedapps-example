'use client';

import Form from 'next/form';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import crypto from 'crypto';

const BeginPage = (): JSX.Element => {

  const [clientId, setClientId] = useState('');
  const [redirectUri, setRedirectUri] = useState('http://localhost:3000/idp_redirect');
  const [codeChallenge, setCodeChallenge] = useState('');


  const generateUrlString = () => {
    var u = new URL(window.location.origin + "/idp_login")
    u.searchParams.append("client_id", clientId)
    u.searchParams.append("redirect_uri", redirectUri)
    u.searchParams.append("scope", "openid profile email phone")
    u.searchParams.append("response_type", "code")
    u.searchParams.append("code_challenge", codeChallenge);
    u.searchParams.append("code_challenge_method", "S256");
    return u.href;
  };

  const generateChallengeFromVerifier = (verifier: String) => {
    const hash = crypto.createHash('sha256');
    hash.update(verifier);
    const hashed = hash.digest('base64').replaceAll('/', '_').replaceAll('+', '-').replaceAll('=', '');
    //const b64_encoded = Buffer.from(hashed).toString('base64');
    setCodeChallenge(hashed)
  };

  const writeCodeVerifier = (verifier: String) => {
    console.log("write");
    if (verifier === undefined){
        console.error("Undefined verifier");
    }
    setCodeVerifier(verifier);
    generateChallengeFromVerifier(verifier);
    localStorage.setItem("code_verifier", verifier)
  };

  const generateCodeVerifier = () => {
    return crypto.randomBytes(Math.ceil(16)).toString('hex').slice(0, 32);
  }

  const [codeVerifier, setCodeVerifier] = useState( () => {
    var verifier = localStorage.getItem("code_verifier")
    if (verifier === null || verifier === '') {
      console.log("No verifier stored")
      verifier = generateCodeVerifier()
      localStorage.setItem("code_verifier", verifier)
    }
    generateChallengeFromVerifier(verifier);
    return verifier;
  });

  return (
    <div>
      <h1>Parameters required to use the StytchIDP component</h1>
      <p>We're going to construct a URL to navigate to the page hosting the StytchIDP component.</p>
      <p>On navigating to this page, the component will take the URL parameters and begin an OIDC login flow.</p>
      <Form>
        <label>
          <div>Stytch Client App ID</div>
          <input name="client_id"
            onChange={(e) => setClientId(e.target.value)}/>
        </label>
        <label>
          <div>Stytch Client Redirect URI</div>
          <input name="redirect_uri"
            defaultValue={redirectUri}
            onChange={(e) => setRedirectUri(e.target.value)}/>
        </label>
        <label>
          <div>PKCE Code Verifier</div>
          <input name="code_verifier"
            defaultValue={codeVerifier}
            onChange={(e) => writeCodeVerifier(e.target.value)}/>
          <p>PKCE Code Challenge (SHA-256 of Code Verifier)</p>
          <p>{codeChallenge}</p>
        </label>
      </ Form>
      <Link href={generateUrlString()}>{generateUrlString()}</Link>
    </div>
  )
};

export default BeginPage;
