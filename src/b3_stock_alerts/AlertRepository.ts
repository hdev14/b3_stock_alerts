import { Alert } from './Alert';

export type ListAlertParams = {
  skip: number;
  limit: number;
};

export default interface AlertRepository {
  getAlert(alert_id: string): Promise<Alert | null>;
  createAlert(alert: Alert): Promise<void>;
  deleteAlert(alert_id: string): Promise<void>;
  listAlertsByUserId(user_id: string): Promise<Alert[]>;
  listAlerts(params: ListAlertParams): Promise<Alert[]>;
}
