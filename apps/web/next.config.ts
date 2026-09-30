import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  transpilePackages: ['@kalya/types', '@kalya/utils', '@kalya/validations'],
};

export default nextConfig;
