import StockSearcher, { StockInfo } from "./SockSearcher";

// Web scrapping
// TODO: install Cheerio
export default class WSStockSearcher implements StockSearcher {
  search(stock: string): Promise<StockInfo> {
    console.log(stock);
    throw new Error("Method not implemented.");
  }
}