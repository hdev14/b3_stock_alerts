import { Client } from "pg";

export default class Postgres {
  private client?: Client;

  private constructor() {
    this.client = new Client({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!, 10),
      database: process.env.DB_DATABSE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
  }

  getClient() {
    if (this.client === undefined) {
      new Postgres();
    }

    return this.client;
  }
}