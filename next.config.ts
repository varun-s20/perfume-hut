import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
  // Dev only: lets a phone on the same Wi-Fi open the dev server by its local
  // address (http://192.168.x.x:3000 and the like). Without it Next blocks the
  // dev connection, the page never comes to life and the 3D store never loads.
  allowedDevOrigins: ['10.*.*.*', '192.168.*.*', '172.*.*.*', '*.local'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
