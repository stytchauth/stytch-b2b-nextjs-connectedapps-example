'use client';

import Form from 'next/form';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import crypto from 'crypto';
import ValidatingInput from "@/components/ValidatingInput";

const BeginPage = (): JSX.Element => {

  /*** Client ID parameter ***
   * This parameter is given in the Stytch dashboard when you create a new Connected App client.
   */

  const [clientId, setClientId] = useState('');
  /**
   * Write the client id to local storage - we will need it for the next request.
   */
  const writeClientId = (id: String) => {
    setClientId(id)
    if (id === '') {
      localStorage.removeItem("client_id")
      return;
    }
    localStorage.setItem("client_id", id)
  }

  // Set a default placeholder value and save it to a variable; we consider it an error if
  // the value does not change from the default value.
  const clientIdDefaultValue = "(like idp-client****)"
  const validateClientId = (id: String) =>  {
    if (id === clientIdDefaultValue) {
      return "Must enter in a new Client App ID";
    }
    if (id === '') {
      return "Client App ID cannot be blank";
    }
    return true;
  }

  /**** Redirect URI parameter ***
   * This parameter is configured on the Connected App client. It's under the heading "Login redirect URLs".
   * The value of this field must match exactly one of the values in the in the dashboard.
   */

  const [redirectUri, setRedirectUri] = useState('http://localhost:3000/idp_redirect');
  /**
   * Write the redirect_url to local storage - we will need it for the next request.
   */
  const writeRedirectUri = (uri: String) => {
    setRedirectUri(uri)
    if (uri === '') {
      localStorage.removeItem("redirect_uri")
      return;
    }
    localStorage.setItem("redirect_uri", uri)
  }

  const validateRedirectUri = (uri: String) => {
    if (uri === '') {
      return "URI cannot be blank";
    }
    try{
      new URL(uri);
    } catch (err) {
      return "URI invalid / cannot parse";
    }
    return true;
  }

  /*** Code verifier and code challenge
   * PKCE uses these values in order to ensure that each request from the client is happening
   * from the same machine / browser in order to prevent a malicious actor from hijacking
   * the returned code that's delivered to the Redirect URI.
   *
   * The code_verifier is any value between 43 and 128 bytes (recommended: a cryptographically secure
   * random value). The code_challenge is generated from the code_verifier as a base64-encoded
   * representation of the sha-256 hash of the code_verifier.
   */

  const [codeChallenge, setCodeChallenge] = useState('');

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
    console.log("Verifier: " + verifier);
    if (verifier === null || verifier === '') {
      console.log("Verifier empty")
      localStorage.removeItem("code_verifier")
      resetOrReadCodeVerifier();
      return;
    }
    setCodeVerifier(verifier);
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

  const validateCodeVerifier = (verifier: String) => {
    console.log(verifier);
    if (verifier.length < 43 || verifier.length > 128) {
      return "Code verifier must be between 43 and 128 bytes in length";
    }
    return true;
  }

  const [codeVerifier, setCodeVerifier] = useState( () => {
    return resetOrReadCodeVerifier()
  });


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

  return (
    <div>
      <h1>Parameters required to use the <code>&lt;StytchIDP /&gt;</code> component:</h1>
      <p>We're going to construct a URL to navigate to the page hosting the <code>&lt;StytchIDP /&gt;</code> component.</p>
      <p>On navigating to this page, the component will take these URL parameters and begin an OIDC login flow with PKCE.</p>
      <Form>
        <label>
          <div>Stytch Client App ID</div>
          <ValidatingInput name="client_id"
            defaultValue={clientIdDefaultValue}
            validator={validateClientId}
            changeHandler={writeClientId} />
        </label>
        <label>
          <div>Stytch Client Redirect URI</div>
          <ValidatingInput name="redirect_uri"
            defaultValue={redirectUri}
            validator={validateRedirectUri}
            changeHandler={writeRedirectUri} />
        </label>
        <label>
          <div>PKCE Code Verifier</div>
          <ValidatingInput name="code_verifier"
            defaultValue={codeVerifier}
            validator={validateCodeVerifier}
            changeHandler={writeCodeVerifier} />
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
