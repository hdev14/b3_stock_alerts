import AlertService from "@b3_stock_alerts/AlertService";
import BcryptEncryptor from "@b3_stock_alerts/BcryptEncryptor";
import EmailAlertNotification from "@b3_stock_alerts/EmailAlertNotification";
import PgAlertRepository from "@b3_stock_alerts/PgAlertRepository";
import PgUserRepository from "@b3_stock_alerts/PgUserRepository";
import ScheduleHandler from "@b3_stock_alerts/ScheduleHandler";
import StockEventHandler from "@b3_stock_alerts/StockEventHandler";
import UserService from "@b3_stock_alerts/UserService";
import WSStockSearcher from "@b3_stock_alerts/WSStockSearcher";

export const alert_repository = new PgAlertRepository();
export const user_repository = new PgUserRepository();
export const stock_searcher = new WSStockSearcher();
export const schedule_handler = new ScheduleHandler(alert_repository, stock_searcher);
export const alert_service = new AlertService(alert_repository, user_repository);
export const user_service = new UserService(user_repository, new BcryptEncryptor());
export const alert_notification = new EmailAlertNotification();
export const stock_event_handler = new StockEventHandler(alert_notification, user_repository);

schedule_handler.on('stock_event', stock_event_handler.handle.bind(stock_event_handler));

schedule_handler.on('uncaughtException', function (error) {
  console.error('uncaughtException:', error.stack);
});
