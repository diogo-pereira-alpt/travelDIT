/** @type {import('next').NextConfig} */
const nextConfig = {
    // Note: 'output: export' is not compatible with NextAuth
    // For deployment with NextAuth, use a provider that supports server-side rendering (Vercel, Netlify, etc.)
    // For static export without auth, comment out NextAuth integration
    // output: 'export',
    images: {
      unoptimized: true,
    },
    // Comentado para desenvolvimento local
    // basePath: '/travelDIT', // Substitua pelo nome do seu repositório GitHub
    // assetPrefix: '/travelDIT/', // Substitua pelo nome do seu repositório GitHub
  }
  
  module.exports = nextConfig