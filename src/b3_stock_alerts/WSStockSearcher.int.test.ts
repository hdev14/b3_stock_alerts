import { faker } from '@faker-js/faker/locale/pt_BR';
import StockNotFoundError from '@shared/StockNotFound';
import * as cheerio from 'cheerio';
import WSStockSearcher from './WSStockSearcher';

describe('WSStockSearcher int tests', () => {
  const fetch_spy = jest.spyOn(global, 'fetch');
  const load_spy = jest.spyOn(cheerio, 'load');
  const stock_searcher = new WSStockSearcher();

  it('returns the correct value of the stock', async () => {
    expect.assertions(4);

    const stock_info = await stock_searcher.search('TAEE3');

    expect(fetch_spy).toHaveBeenCalledWith('https://statusinvest.com.br/acoes/taee3');
    expect(load_spy.mock.calls[0][0]).toBeInstanceOf(Buffer);
    expect(stock_info.amount).toBeDefined();
    expect(typeof stock_info.amount).toEqual('number');
  });

  it("throws a StockNotFoundError if page doesn't exist", async () => {
    expect.assertions(1);

    try {
      await stock_searcher.search(faker.string.alphanumeric(6));
    } catch (e) {
      expect(e).toBeInstanceOf(StockNotFoundError);
    }
  });
});
