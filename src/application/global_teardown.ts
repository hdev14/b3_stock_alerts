import { type FullConfig } from '@playwright/test';
import Postgres from '@shared/Postgres';

async function globalTeardown(_config: FullConfig) {
  globalThis.db_client = Postgres.getClient();
  await globalThis.db_client.connect();

  // Purge database
  await globalThis.db_client.query('DELETE FROM user_confirmation_codes');
  await globalThis.db_client.query('DELETE FROM alerts');
  await globalThis.db_client.query('DELETE FROM users');
}

export default globalTeardown;
