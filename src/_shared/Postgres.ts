import { Client } from 'pg';

export default class Postgres {
  private static client?: Client;

  private constructor() {
    try {
      Postgres.client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT!, 10),
        database: process.env.DB_DATABSE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });
    } catch (e: any) {
      console.error(e.stack, e.message);
      throw e;
    }
  }

  static getClient() {
    if (Postgres.client === undefined) {
      // eslint-disable-next-line no-new
      new Postgres();
    }

    return Postgres.client!;
  }
}
