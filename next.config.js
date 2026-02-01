/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    images: {
        remotePatterns: [],
    },
    async rewrites() {
        return [
            {
                source: "/uploads/:filename*",
                destination: "/api/uploads/:filename*",
            },
        ];
    },
}

module.exports = nextConfig
