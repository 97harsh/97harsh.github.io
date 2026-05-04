import '@/styles/poole.css';
import '@/styles/hyde.css';
import '@/styles/syntax.css';
import '@/styles/custom.css';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { FontProvider } from '@/contexts/FontContext';
import Layout from '@/components/Layout';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <FontProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </FontProvider>
  );
}
