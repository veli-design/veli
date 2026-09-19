import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@tradenetcorp/veli-ui', '@tradenetcorp/veli-tokens'],
};

export default nextConfig;
