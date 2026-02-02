import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    images: {
        unoptimized: true,
    },
    async rewrites() {
        return [
            {
                source: "/uploads/:filename*",
                destination: "/api/uploads/:filename*",
            },
        ];
    },
};

export default nextConfig;
