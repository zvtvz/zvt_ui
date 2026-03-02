/** @type {import('next').NextConfig} */
const nextConfig = {
  // 开发联调时禁用 static export，否则可能导致路由 404
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
