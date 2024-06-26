import AlertService from '@b3_stock_alerts/AlertService';
import AuthService from '@b3_stock_alerts/AuthService';
import BcryptEncryptor from '@b3_stock_alerts/BcryptEncryptor';
import CoreAuthenticator from '@b3_stock_alerts/CoreAuthenticator';
import EmailGateway from '@b3_stock_alerts/EmailGateway';
import PgAlertRepository from '@b3_stock_alerts/PgAlertRepository';
import PgUserRepository from '@b3_stock_alerts/PgUserRepository';
import ScheduleHandler from '@b3_stock_alerts/ScheduleHandler';
import StockEventHandler from '@b3_stock_alerts/StockEventHandler';
import UserService from '@b3_stock_alerts/UserService';
import WSStockSearcher from '@b3_stock_alerts/WSStockSearcher';

const alert_repository = new PgAlertRepository();
const user_repository = new PgUserRepository();
const stock_searcher = new WSStockSearcher();
const email_gateway = new EmailGateway();
export const stock_event_handler = new StockEventHandler(email_gateway, user_repository);
export const schedule_handler = new ScheduleHandler(alert_repository, stock_searcher);
const encryptor = new BcryptEncryptor();
const authenticator = new CoreAuthenticator();
export const user_service = new UserService(user_repository, encryptor);
export const alert_service = new AlertService(alert_repository, user_repository);
export const auth_service = new AuthService(
  user_repository,
  encryptor,
  authenticator,
  email_gateway,
  email_gateway,
);
