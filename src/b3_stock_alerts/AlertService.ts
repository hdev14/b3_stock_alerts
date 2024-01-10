import NotFoundError from "@shared/NotFoundError";
import Result from "@shared/Result";
import { randomUUID } from "crypto";
import { Alert } from "./Alert";
import AlertRepository from "./AlertRepository";

export type CreateAlertParams = {
  user_id: string;
  stock: string;
  amount: number;
};

export default class AlertService {
  constructor(readonly repository: AlertRepository) { }

  async createMaxAlert(params: CreateAlertParams): Promise<Result<Alert>> {
    const alert: Alert = {
      id: randomUUID(),
      stock: params.stock,
      user_id: params.user_id,
      max_amount: params.amount,
    };

    await this.repository.createAlert(alert);

    return { data: alert };
  }

  async createMinAlert(params: CreateAlertParams): Promise<Result<Alert>> {
    const alert: Alert = {
      id: randomUUID(),
      stock: params.stock,
      user_id: params.user_id,
      min_amount: params.amount,
    };

    await this.repository.createAlert(alert);

    return { data: alert };
  }

  async removeAlert(alert_id: string): Promise<Result | void> {
    const alert = await this.repository.getAlert(alert_id);

    if (!alert) {
      return { error: new NotFoundError('Alert not found') };
    }

    await this.repository.deleteAlert(alert_id);
  }
}