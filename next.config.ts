import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Nixpacks kullanıldığında standalone gerekmiyor (npm start kullanır)
  reactCompiler: true,
};

export default nextConfig;
