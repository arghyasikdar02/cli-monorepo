import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../..'),
  transpilePackages: ['@cyberlabin/ui','@cyberlabin/api-client','@cyberlabin/database','@cyberlabin/config','@cyberlabin/logger','@cyberlabin/types','@cyberlabin/auth-guards']
};
export default nextConfig;
