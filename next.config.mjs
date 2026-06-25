/** @type {import('next').NextConfig} */
const nextConfig = {
  // 'standalone' only needed for Docker self-hosting; Vercel handles its own output
  ...(process.env.DOCKER_BUILD === '1' ? { output: 'standalone' } : {}),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma']
  }
}

export default nextConfig
