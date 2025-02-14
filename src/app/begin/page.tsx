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

  /**
   *  Generate the code_challenge from the given code_verifier.
   *
   *  The PKCE standard says the method to do this is
   *  BASE64URL-ENCODE(SHA256(ASCII(code_verifier)))
   *  https://datatracker.ietf.org/doc/html/rfc7636#section-4.2
   *
   *  This is done on the _initial request_; that is, on the request to the page that
   *  hosts the <StytchIDP /> component we should give it the processed code_challenge,
   *  which is sent to the server.
   *
   */
  const generateChallengeFromVerifier = (verifier: String) => {
    //Assume that `verifier` is already an ASCII string.
    //The spec indicates conversion to ASCII for e.g. Unicode strings, binary data,
    //and any similar conversions from other seed data, but 
    const hash = crypto.createHash('sha256');
    hash.update(verifier);
    //For... reasons there is a slight disagreement in what 'base64' means in the crypto library
    //and what is expected to be received on the server. Specifically these characters are expected
    //to be replaced. More information can be found in the spec at 
    //https://datatracker.ietf.org/doc/html/rfc7636#appendix-A
    const hashed = hash.digest('base64').replaceAll('/', '_').replaceAll('+', '-').replaceAll('=', '');
    setCodeChallenge(hashed)
  };

  /**
   * Write the code verifier to local storage - we will need it for the next request.
   *
   */
  const writeCodeVerifier = (verifier: String) => {
    console.log("write");
    if (verifier === undefined){
        console.error("Undefined verifier");
    }
    // Update state...
    setCodeVerifier(verifier);
    // Store...
    localStorage.setItem("code_verifier", verifier)
    // And preemptively update the code_challenge state so it's ready to use
    generateChallengeFromVerifier(verifier);
  };

  /**
   * Generate a random value for the code verifier that is compliant with the PKCE
   * spec. The spec says,
   *
   * "code_verifier = high-entropy cryptographic random STRING using the
   * unreserved characters [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
   * from Section 2.3 of [RFC3986], with a minimum length of 43 characters
   * and a maximum length of 128 characters."
   * https://datatracker.ietf.org/doc/html/rfc7636#section-4.1
   */
  const generateCodeVerifier = () => {
    return crypto.randomBytes(Math.ceil(24)).toString('hex').slice(0, 48);
  }

  /**
   * Initialize the code verifier state if there's no value in local storage.
   */

  const resetOrReadCodeVerifier = () => {
    // TODO: there is some duplication of logic between here and writeCodeVerifier.
    // writeCodeVerifier calls the state function `setCodeVerifier`, but this init
    // function doesn't have access to that yet. Similarly, this function ignores
    // the current value in the UI of the code_verifier, but writeCodeVerifier is
    // run on the onChange handler of the UI to keep local storage up to date...
    // hmm.
    var verifier = localStorage.getItem("code_verifier")
    if (verifier === null || verifier === '') {
      console.log("No verifier stored")
      verifier = generateCodeVerifier()
      localStorage.setItem("code_verifier", verifier)
    }
    generateChallengeFromVerifier(verifier);
    return verifier;
  }

  const [codeVerifier, setCodeVerifier] = useState( () => {
    return resetOrReadCodeVerifier()
  });

  return (
    <div>
      <h1>Parameters required to use the StytchIDP component:</h1>
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
          <p>PKCE Code Challenge (BASE64(SHA-256(code_verifier))</p>
          <p>{codeChallenge}</p>
        </label>
      </ Form>
      <Link href={generateUrlString()}>{generateUrlString()}</Link>
    </div>
  )
};

export default BeginPage;
