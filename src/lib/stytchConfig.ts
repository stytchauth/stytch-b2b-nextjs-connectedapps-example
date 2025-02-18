import localFont from 'next/font/local';
import { B2BProducts, AuthFlowType } from '@stytch/vanilla-js/b2b';

const stytchFont = localFont({
  src: "../../public/fonts/Booton-Regular.woff2"
});


export const discoveryConfig = {
  authFlowType: AuthFlowType.Discovery,
  products: [B2BProducts.emailMagicLinks],
  sessionOptions: {
    sessionDurationMinutes: 60,
  },
};

export const discoveryStyles = {
  container: {
    width: '500px',
  },
  fontFamily: stytchFont.style.fontFamily,
};
