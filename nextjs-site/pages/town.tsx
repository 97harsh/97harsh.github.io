import dynamic from 'next/dynamic';
import Head from 'next/head';
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from './_app';

// Town uses window/requestAnimationFrame and a CDN-loaded TFJS — opt out of SSR.
const NpcTown = dynamic(() => import('@/components/NpcTown'), { ssr: false });

const TownPage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Harsh.Town — A Tiny Transformer Talks To Itself</title>
        <meta
          name="description"
          content="A soft pixel top-down portfolio town. A tiny self-attention layer running in your browser via TensorFlow.js drives autonomous NPC chatter."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <NpcTown />
    </>
  );
};

// Bypass the global Layout — town renders full-viewport.
TownPage.getLayout = (page: ReactElement) => page;

export default TownPage;
