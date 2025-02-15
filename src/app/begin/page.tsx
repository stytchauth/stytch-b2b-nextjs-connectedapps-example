'use client';

import Form from 'next/form';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import crypto from 'crypto';

const BeginPage = (): JSX.Element => {

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

  const prettyPrintUrlString = () => {
    return generateUrlString().replaceAll('?', '?\n').replaceAll('&', '&\n');
  }

  const [clientId, setClientId] = useState('');
  const [clientIdValidClass, setClientIdValidClass] = useState("invalid-input");
  /**
   * Write the client id to local storage - we will need it for the next request.
   */
  const writeClientId = (id: String) => {
    setClientId(id)
    if (id === '') {
      localStorage.removeItem("client_id")
      setClientIdValidClass("invalid-input");
      return;
    }
    setClientIdValidClass("valid-input");
    localStorage.setItem("client_id", id)
  }

  const [redirectUri, setRedirectUri] = useState('http://localhost:3000/idp_redirect');
  const [redirectUriValidClass, setRedirectUriValidClass] = useState("valid-input");
  /**
   * Write the redirect_url to local storage - we will need it for the next request.
   */
  const writeRedirectUri = (uri: String) => {
    setRedirectUri(uri)
    if (uri === '') {
      localStorage.removeItem("redirect_uri")
      setRedirectUriValidClass("invalid-input");
      return;
    }
    setRedirectUriValidClass("valid-input");
    localStorage.setItem("redirect_uri", uri)
  }

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

  /**
   * Write the code verifier to local storage - we will need it for the next request.
   *
   */
  const writeCodeVerifier = (verifier: String) => {
    setCodeVerifier(verifier);
    if (verifier === '') {
      localStorage.removeItem("code_verifier")
      return;
    }
    // Store...
    localStorage.setItem("code_verifier", verifier)
    // And preemptively update the code_challenge state so it's ready to use
    generateChallengeFromVerifier(verifier);
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

  const validateCodeVerifierClass = () => {
    if (codeVerifier.length < 43 || codeVerifier.length > 128) {
      return "invalid-input";
    }
    return "valid-input";
  }

  const [codeVerifier, setCodeVerifier] = useState( () => {
    return resetOrReadCodeVerifier()
  });
  const [codeVerifierValidClass, setCodeVerifierValidClass] = useState( () => {
    return validateCodeVerifierClass()
  });


  return (
    <div>
      <h1>Parameters required to use the <code>&lt;StytchIDP /&gt;</code> component:</h1>
      <p>We're going to construct a URL to navigate to the page hosting the <code>&lt;StytchIDP /&gt;</code> component.</p>
      <p>On navigating to this page, the component will take these URL parameters and begin an OIDC login flow with PKCE.</p>
      <Form>
        <label>
          <div>Stytch Client App ID</div>
          <input name="client_id"
            className={clientIdValidClass}
            onChange={(e) => writeClientId(e.target.value)}/>
        </label>
        <label>
          <div>Stytch Client Redirect URI</div>
          <input name="redirect_uri"
            defaultValue={redirectUri}
            className={redirectUriValidClass}
            onChange={(e) => writeRedirectUri(e.target.value)}/>
        </label>
        <label>
          <div>PKCE Code Verifier</div>
          <input name="code_verifier"
            defaultValue={codeVerifier}
            className={validateCodeVerifierClass()}
            onChange={(e) => writeCodeVerifier(e.target.value)}/>
          <h3>PKCE Code Challenge (BASE64(SHA-256(code_verifier))</h3>
          <p>{codeChallenge}</p>
        </label>
      </ Form>

      <h3>URL used on page hosting <code>&lt;StytchIDP&gt;</code> component.</h3>
      <p>When ready, click this link:</p>
      <Link className="break-all" href={generateUrlString()}>
        <pre>
          {prettyPrintUrlString()}
        </pre>
      </Link>
    </div>
  )
};

export default BeginPage;
