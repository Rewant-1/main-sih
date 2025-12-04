import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // Ensure Turbopack resolves the app root to this folder only to avoid mixing dev modules
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
