import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const nextConfig: NextConfig = {
  // Lets OpenNext resolve Prisma's workerd build (WASM query compiler) for Cloudflare
  serverExternalPackages: ['@prisma/client', '.prisma/client'],
};

export default nextConfig;

// Exposes Cloudflare bindings (getCloudflareContext) during `next dev`
initOpenNextCloudflareForDev();
