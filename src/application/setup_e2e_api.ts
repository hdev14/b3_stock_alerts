/* eslint-disable @typescript-eslint/no-explicit-any */
import Postgres from '@shared/Postgres';
import supertest from 'supertest';
import Server from './Server';

beforeAll(async () => {
  try {
    globalThis.request = supertest(new Server().application);
    globalThis.db_client = Postgres.getClient();
    await globalThis.db_client.connect();

    // Purge database
    await globalThis.db_client.query('DELETE FROM user_confirmation_codes');
    await globalThis.db_client.query('DELETE FROM alerts');
    await globalThis.db_client.query('DELETE FROM users');
  } catch (e: any) {
    console.error(e.stack);
  }
});

afterAll(async () => {
  try {
    await globalThis.db_client.end();
  } catch (e: any) {
    console.error(e.stack);
  }
});
