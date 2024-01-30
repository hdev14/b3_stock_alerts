import AlertRepository from "@b3_stock_alerts/AlertRepository";
import StockSearcher from "@b3_stock_alerts/SockSearcher";
import { StockEvent } from "@shared/generic_types";
import { EventEmitter } from "stream";
import { Alert } from "./Alert";



// TODO
export default class JobHandler extends EventEmitter {
  constructor(
    private readonly alert_repository: AlertRepository,
    private readonly stock_searcher: StockSearcher,
  ) {
    super();
  }

  async handle() {
    let alerts: Alert[];
    let skip = 1;

    do {
      alerts = await this.alert_repository.listAlerts({ limit: 10, skip });

      await this.sendEvents(alerts);

      skip++;
    } while (alerts.length > 0);
  }

  private async sendEvents(alerts: Alert[]) {
    for (let i = 0; i < alerts.length; i++) {
      const alert = alerts[0];
      const stock_info = await this.stock_searcher.search(alert.stock);

      if (alert.max_amount && alert.max_amount !== 0 && alert.max_amount <= stock_info.amount) {
        this.emit('stock_event', {
          current_amount: stock_info.amount,
          isMax: true,
          stock: alert.stock,
          user_id: alert.user_id,
        } as StockEvent);
        continue;
      }

      if (alert.min_amount && alert.min_amount !== 0 && alert.min_amount >= stock_info.amount) {
        this.emit('stock_event', {
          current_amount: stock_info.amount,
          isMax: false,
          stock: alert.stock,
          user_id: alert.user_id,
        } as StockEvent);
      }
    }
  }
}

