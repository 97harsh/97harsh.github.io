import Head from 'next/head';
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import WelcomeModal from './WelcomeModal';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const defaultTitle = 'Harsh Sharma';
const defaultDescription =
  'A personal website showcasing my open source projects, work experience, and publications.';

export default function Layout({ children, title, description }: LayoutProps) {
  const pageTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;
  const pageDescription = description || defaultDescription;

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />

        {/* Fonts */}
        <link
          href="https://fonts.googleapis.com/css?family=PT+Sans:400,400italic,700|Abril+Fatface"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/opendyslexic@1.0.0/OpenDyslexic.css"
          rel="stylesheet"
        />

        {/* Font Awesome */}
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css"
        />

        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </Head>

      <Sidebar />

      <div className="wrap">
        <div className="container content">
          <main>{children}</main>
        </div>
      </div>

      <WelcomeModal />
    </>
  );
}
