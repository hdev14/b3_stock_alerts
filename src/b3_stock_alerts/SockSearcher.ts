export type StockInfo = {
  amount: number;
};

interface StockSearcher {
  search(stock: string): Promise<StockInfo>
}

export default StockSearcher;
