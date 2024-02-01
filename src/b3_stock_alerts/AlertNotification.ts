import { User } from "./User";

export enum AlertNotificationTypes {
  MAX,
  MIN
}

export type NotificationData = {
  stock: string;
  amount: number;
  user: User,
  type: AlertNotificationTypes,
};

export default interface AlertNotification {
  notify(data: NotificationData): Promise<void>;
}