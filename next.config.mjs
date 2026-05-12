/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    // We deploy media from /uploads/ at the repo root (served as static assets).
    // We don't need Next's image optimisation pipeline for this site, and
    // disabling it keeps the deploy purely static-asset-friendly on Vercel.
    unoptimized: true,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/wp-content/uploads/:path*',
        destination: '/uploads/:path*',
        permanent: true,
      },
      {
        source: '/wp-admin/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wp-login.php',
        destination: '/',
        permanent: true,
      },
      {
        source: '/xmlrpc.php',
        destination: '/',
        permanent: true,
      },
      // Legacy booking slugs from the WordPress site
      { source: '/signup', destination: '/book', permanent: true },
      { source: '/signup/', destination: '/book/', permanent: true },
      { source: '/en/signup', destination: '/en/book', permanent: true },
      { source: '/en/signup/', destination: '/en/book/', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, immutable' },
        ],
      },
    ]
  },
}

export default nextConfig
