import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Coolify / Docker için gerekli
  reactCompiler: true,
};

export default nextConfig;
