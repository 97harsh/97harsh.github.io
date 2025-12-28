import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google Analytics (add your GA ID if needed) */}
        {/* <script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script> */}
      </Head>
      <body className="theme-base-08">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
