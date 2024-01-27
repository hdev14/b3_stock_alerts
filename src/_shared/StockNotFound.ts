export default class StockNotFoundError extends Error {
  public stock: string;

  constructor(stock: string) {
    super(`The stock (${stock}) doesn't exist`);
    this.stock = stock;
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, StockNotFoundError.prototype);
  }
}