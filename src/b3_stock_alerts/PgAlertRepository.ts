import Postgres from "@shared/Postgres";
import { Client } from "pg";
import { Alert } from "./Alert";
import AlertRepository from "./AlertRepository";

export default class PgAlertRepository implements AlertRepository {
  private readonly client: Client;

  constructor() {
    this.client = Postgres.getClient();
  }

  async getAlert(alert_id: string): Promise<Alert | null> {
    const result = await this.client.query(
      'SELECT id, stock, user_id, max_amount, min_amount FROM alerts WHERE id = $1',
      [alert_id]
    );

    if (result.rows[0] === undefined) {
      return null;
    }

    return result.rows[0];
  }

  async createAlert(alert: Alert): Promise<void> {
    await this.client.query(
      'INSERT INTO alerts (id, stock, user_id, max_amount, min_amount) VALUES ($1, $2, $3, $4, $5)',
      [alert.id, alert.stock, alert.user_id, alert.max_amount, alert.min_amount]
    );
  }

  async deleteAlert(alert_id: string): Promise<void> {
    await this.client.query('DELETE FROM alerts WHERE id = $1', [alert_id]);
  }
}