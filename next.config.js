/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return {
      beforeFiles: [
        // 1. โดเมนสำหรับพนักงานสอบสวน (Police Domain)
        {
          source: '/',
          has: [
            {
              type: 'host',
              value: '(?<subdomain>police-remand\\.vercel\\.app|police\\.udon-remand\\.go\\.th|police\\.localhost)',
            },
          ],
          destination: '/police',
        },
        // 2. โดเมนสำหรับเจ้าหน้าที่ศาล (Court Domain)
        {
          source: '/',
          has: [
            {
              type: 'host',
              value: '(?<subdomain>court-remand\\.vercel\\.app|court\\.udon-remand\\.go\\.th|court\\.localhost)',
            },
          ],
          destination: '/court',
        },
      ],
    };
  },
};

module.exports = nextConfig;
