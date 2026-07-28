import { randomBytes } from 'crypto';

/** Resolve the admin secret — required for admin panel access. */
function resolveAdminSecret(): string {
  const env = process.env['ADMIN_SECRET'];
  if (env && env.trim().length >= 8) return env.trim();

  const generated = randomBytes(12).toString('hex'); // 24-char hex string
  process.env['ADMIN_SECRET'] = generated;

  const border = '='.repeat(60);
  console.warn(
    `\n${border}\n` +
    '[ADMIN] ADMIN_SECRET is not set in environment variables.\n' +
    `[ADMIN] Temporary admin password for this session: ${generated}\n` +
    '[ADMIN] This changes every time the server restarts!\n' +
    '[ADMIN] Add ADMIN_SECRET to your environment secrets to make it permanent.\n' +
    `${border}\n`,
  );
  return generated;
}

export const ADMIN_SECRET = resolveAdminSecret();
