import NotFoundError from "@shared/NotFoundError";
import { Result } from "@shared/generic_types";
import { randomUUID } from "crypto";
import { Alert } from "./Alert";
import AlertRepository from "./AlertRepository";
import UserRepository from "./UserRepository";

export type CreateAlertParams = {
  user_id: string;
  stock: string;
  amount: number;
};

export default class AlertService {
  constructor(
    private readonly alert_repository: AlertRepository,
    private readonly user_repository: UserRepository
  ) { }

  async createMaxAlert(params: CreateAlertParams): Promise<Result<Alert>> {
    const alert: Alert = {
      id: randomUUID(),
      stock: params.stock,
      user_id: params.user_id,
      max_amount: params.amount,
    };

    const user = await this.user_repository.getUser(params.user_id);

    if (!user) {
      return { error: new NotFoundError('User not found') };
    }

    await this.alert_repository.createAlert(alert);

    return { data: alert };
  }

  async createMinAlert(params: CreateAlertParams): Promise<Result<Alert>> {
    const alert: Alert = {
      id: randomUUID(),
      stock: params.stock,
      user_id: params.user_id,
      min_amount: params.amount,
    };

    const user = await this.user_repository.getUser(params.user_id);

    if (!user) {
      return { error: new NotFoundError('User not found') };
    }

    await this.alert_repository.createAlert(alert);

    return { data: alert };
  }

  async removeAlert(alert_id: string): Promise<Result | void> {
    const alert = await this.alert_repository.getAlert(alert_id);

    if (!alert) {
      return { error: new NotFoundError('Alert not found') };
    }

    await this.alert_repository.deleteAlert(alert_id);
  }

  async listUserAlerts(user_id: string): Promise<Result<Alert[]>> {
    const user = await this.user_repository.getUser(user_id);

    if (!user) {
      return { error: new NotFoundError('User not found') };
    }

    const alerts = await this.alert_repository.listAlertsByUserId(user_id);

    return { data: alerts };
  }
}