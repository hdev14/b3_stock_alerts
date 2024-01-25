import { Alert } from "./Alert";

export default interface AlertRepository {
  getAlert(alert_id: string): Promise<Alert | null>;
  createAlert(alert: Alert): Promise<void>;
  deleteAlert(alert_id: string): Promise<void>;
  listAlertsByUserId(user_id: string): Promise<Alert[]>;
}