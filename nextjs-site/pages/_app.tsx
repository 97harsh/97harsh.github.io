import '@/styles/poole.css';
import '@/styles/hyde.css';
import '@/styles/syntax.css';
import '@/styles/custom.css';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { FontProvider } from '@/contexts/FontContext';
import Layout from '@/components/Layout';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);
  return (
    <FontProvider>
      {getLayout(<Component {...pageProps} />)}
    </FontProvider>
  );
}
