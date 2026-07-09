import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config Next.js */
    turbopack: {},
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "127.0.0.1",
                port: "54321",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
};

module.exports = {
    allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
