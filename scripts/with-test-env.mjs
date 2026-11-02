// Runs a command with .env.test loaded, overriding any existing shell variables
// (so a production DATABASE_URL in the shell can't leak into test tooling).
import { spawnSync } from 'node:child_process';
import { config } from 'dotenv';

config({ path: '.env.test', override: true, quiet: true });
const [cmd, ...args] = process.argv.slice(2);
const { status } = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
process.exit(status ?? 1);
