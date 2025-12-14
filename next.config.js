// next.config.js
/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')({
  extension: /\.mdx$/,
});

const nextConfig = withMDX({
  pageExtensions: ['ts', 'tsx', 'mdx'],
  experimental: {
    turbo: false, // disables Turbopack
  },
});

module.exports = nextConfig;
