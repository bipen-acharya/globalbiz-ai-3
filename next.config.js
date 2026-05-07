/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
    ],
  },
  // lucide-react v1.14.0 has an internal ESM/CJS mismatch that breaks
  // Next.js 14's __barrel_optimize__ loader. Direct icon imports fix it.
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      skipDefaultConversion: false,
    },
  },
};

module.exports = nextConfig;