import StockNotFoundError from '@shared/StockNotFound';
import { load } from 'cheerio';
import StockSearcher, { StockInfo } from "./SockSearcher";

export default class WSStockSearcher implements StockSearcher {
  private static CSS_selector = '.special > div:nth-child(1) > div:nth-child(1) > strong:nth-child(3)'
  async search(stock: string): Promise<StockInfo> {
    const response = await fetch(`https://statusinvest.com.br/acoes/${stock.toLocaleLowerCase()}`);

    if (response.status >= 400) {
      throw new StockNotFoundError(stock);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const $ = load(buffer);
    const stock_amount = $(WSStockSearcher.CSS_selector).text();

    return {
      amount: parseFloat(stock_amount.replace(',', '.')),
    };
  }
}

