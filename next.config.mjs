/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
      unoptimized: true,
    },
    basePath: '/calculadoraViagens', // Substitua pelo nome do seu repositório GitHub
    assetPrefix: '/calculadoraViagens/', // Substitua pelo nome do seu repositório GitHub
  }
  
  module.exports = nextConfig