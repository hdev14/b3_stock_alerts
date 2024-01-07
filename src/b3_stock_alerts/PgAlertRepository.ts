import { Alert } from "./Alert";
import AlertRepository from "./AlertRepository";

export default class PgAlertRepository implements AlertRepository {
  getAlert(alert_id: string): Promise<Alert | null> {
    throw new Error("Method not implemented.");
  }

  createAlert(alert: Alert): Promise<void> {
    throw new Error("Method not implemented.");
  }
  
  deleteAlert(alert_id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}