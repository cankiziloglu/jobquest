import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// Every route is dynamic (per-user, auth-gated), so no incremental cache
// (R2/KV) is configured.
export default defineCloudflareConfig({});
