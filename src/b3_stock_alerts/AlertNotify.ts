import { Alert } from "./Alert";
import { User } from "./User";

export enum AlertNotificationTypes {
  MAX,
  MIN
}

export default interface AlertNotification {
  notify(alert: Alert, user: User, type: AlertNotificationTypes): Promise<void>;
}