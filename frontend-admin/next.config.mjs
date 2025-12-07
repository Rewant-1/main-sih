import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
    /* config options here */
    turbopack: {
        // Ensure Turbopack resolves the app root to this folder only to avoid mixing dev modules
        root: path.resolve(__dirname),
    },
    // Note: keep only supported turbopack config here. Avoid unsupported experimental keys.
};

export default nextConfig;
