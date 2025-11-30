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
};

export default nextConfig;
