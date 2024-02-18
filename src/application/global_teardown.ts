import { type FullConfig } from '@playwright/test';
import Postgres from '@shared/Postgres';

async function globalTeardown(_config: FullConfig) {
  const db_client = Postgres.getClient();

  // Purge database
  await db_client.query('DELETE FROM user_confirmation_codes');
  await db_client.query('DELETE FROM alerts');
  await db_client.query('DELETE FROM users WHERE email <> $1', ['user_test@test.com']);
}

export default globalTeardown;
