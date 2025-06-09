/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googleapis.com maps.gstatic.com apis.google.com;
              style-src 'self' 'unsafe-inline' *.googleapis.com;
              img-src 'self' data: *.googleapis.com *.gstatic.com firebasestorage.googleapis.com;
              font-src 'self' data: *.gstatic.com;
              connect-src 'self' *.googleapis.com firebasestorage.googleapis.com;
              frame-src 'self' *.google.com *.firebaseapp.com firebase.google.com *.firebase.com;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      },
    ];
  },
};

export default nextConfig;
