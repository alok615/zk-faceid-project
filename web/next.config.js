/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fix fallback for browser-side modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        encoding: false,
        'pino-pretty': false,
        'thread-stream': false,
        'pino-worker': false,
        'pino-file': false,
      }

      // Externalize problematic modules completely
      config.externals = config.externals || []
      config.externals.push(
        'pino-pretty',
        'encoding',
        'thread-stream',
        'pino-worker',
        'pino-file',
        {
          'node:fs': 'commonjs fs',
          'node:crypto': 'commonjs crypto',
        }
      )
    }

    return config
  },
  // Fixed: Remove experimental wrapper - use serverExternalPackages directly
  serverExternalPackages: ['pino', 'pino-pretty']
}

module.exports = nextConfig
