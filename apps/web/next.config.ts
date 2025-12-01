import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "7v8ypubo0r.ufs.sh",
        pathname: "/f/*",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/auth/:path*",
        destination: `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
