/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Enable static export for GitHub Pages
  images: {
    unoptimized: true, // Required for static export
  },
  async redirects() {
    return [
      {
        source: '/:year/:month/:day/:slug',
        destination: '/posts/:slug',
        permanent: true, // 301 redirect
      },
    ];
  },
}

module.exports = nextConfig
