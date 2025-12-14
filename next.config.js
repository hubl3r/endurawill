/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')({
  extension: /\.(md|mdx)$/,
});

const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
};

module.exports = withMDX(nextConfig);
