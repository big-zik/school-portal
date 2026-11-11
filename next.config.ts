import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* Standard production config */
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
}

export default nextConfig
