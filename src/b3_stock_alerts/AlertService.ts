import Result from "@shared/Result";
import { Alert } from "./Alert";
import AlertRepository from "./AlertRepository";

export type CreateAlertParams = {
  stock: string;
  amount: number;
};

export default class AlertService {
  constructor(readonly repository: AlertRepository) {}

  createMaxAlert(params: CreateAlertParams): Promise<Result<Alert>> {
    throw new Error('not implemented');
  }

  createMinAlert(params: CreateAlertParams): Promise<Result<Alert>> {
    throw new Error('not implemented');
  }

  removeAlert(alert_id: string): Promise<Result> {
    throw new Error('not implemented');
  }

  listUserAlerts(user_id: string): Promise<Result<Array<Alert>>> {
    throw new Error('not implemented');
  }
}