import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Harsh Sharma</title>
      </Head>

      <div className="page">
        <h1 className="page-title">Welcome</h1>
        <p>
          This is the Next.js migration of 97harsh.github.io. The foundation is set up with:
        </p>
        <ul>
          <li>✅ Next.js 14.x with Pages Router</li>
          <li>✅ TypeScript for type safety</li>
          <li>✅ Font toggle system (Default ↔ OpenDyslexic)</li>
          <li>✅ Welcome modal on first visit</li>
          <li>✅ Existing CSS preserved</li>
          <li>✅ Sidebar with navigation</li>
        </ul>
        <p>
          <strong>Next steps:</strong> Content migration, tag filtering, pagination, and TensorFlow.js integration.
        </p>
      </div>
    </>
  );
}
