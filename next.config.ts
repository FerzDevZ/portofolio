import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // A stray lockfile in the parent directory makes Next infer the wrong
  // workspace root, which would widen output file tracing beyond this app.
  outputFileTracingRoot: path.join(__dirname),
  // The dev server is reached over loopback under either host name.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
