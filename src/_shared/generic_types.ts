export type Result<T = unknown> = {
  error?: Error,
  data?: T
};

export type StockEvent = {
  user_id: string;
  stock: string;
  current_amount: number;
  isMax: boolean;
};
