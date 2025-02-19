# stytch-b2b-nextjs-connectedapps-example

A Stytch Connected App with Authorization Code Flow with PKCE.
=======

## What's this?

This repository is an example of a Stytch Connected App&mdash;configured in Stytch as a "Public App"&mdash;and implementing both sides: this app is both the Identity Provider as well as the Relying Party that is logging in with the Identity Provider.

It's intended to give some clarity on how to implement this flow and how Connected Apps work with Stytch in general. There are some nuances with how this flow operates (particularly with regards to how the `code_verifier` and `code_challenge` are implemented to be PKCE compliant) and we hope that providing a reference will prove useful in implementing your own app!

## Getting Started

* Clone the repository to your local machine.
* Copy `.env.local.template` to `.env.local` and adjust it to fit values from your own Stytch account.
* Run the development server with `npm run dev` (or similar if using a different tool from NPM)

Open [http://localhost:3000](http://localhost:3000) with your browser to see the landing page.

## Learn more

The descriptions on each page are intended to give you guidance for how to proceed with this app. Keep in mind that the point of this app is not only to demonstrate what a user experiences when working with this flow, but also to provide guidance in code for how to implement this flow yourself - please do look at the source files!

When it comes to setting up Connected Apps in Stytch, please review our [getting started guide](https://stytch.com/docs/b2b/guides/connected-apps/getting-started) for more information about their configuration!

## Contributing

This app is intended to provide a reference for other developers, and is in a early / beta release state. Please do not hesitate to [file an issue](https://github.com/stytchauth/stytch-b2b-nextjs-connectedapps-example/issues) or [create a pull request](https://github.com/stytchauth/stytch-b2b-nextjs-connectedapps-example/pulls) with improvements!

We're especially interested in:
* Superficial changes: typos, the copy could be clearer, etc...
* Structural changes: if it makes sense to you to e.g. break out a page into more sub-components, we'd love to hear it!
* Usability changes: it's admittedly quite open for enhancements to how the app feels to use
* Bugs: of course. If it doesn't seem to do what it should do, let us know!
