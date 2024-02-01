import { StockEvent } from "@shared/generic_types";
import AlertNotification, { AlertNotificationTypes } from "./AlertNotification";
import UserRepository from "./UserRepository";

export default class StockEventHandler {
  constructor(
    private readonly alert_notification: AlertNotification,
    private readonly user_repository: UserRepository,
  ) { }

  async handle(stock_event: StockEvent) {
    const user = await this.user_repository.getUser(stock_event.user_id);

    if (user) {
      await this.alert_notification.notify({
        amount: stock_event.current_amount,
        stock: stock_event.stock,
        user,
        type: stock_event.isMax ? AlertNotificationTypes.MAX : AlertNotificationTypes.MIN,
      });
    }
  }
}