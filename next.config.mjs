/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
      unoptimized: true,
    },
    basePath: '/travelDIT', // Substitua pelo nome do seu repositório GitHub
    assetPrefix: '/travelDIT/', // Substitua pelo nome do seu repositório GitHub
  }
  
  module.exports = nextConfig