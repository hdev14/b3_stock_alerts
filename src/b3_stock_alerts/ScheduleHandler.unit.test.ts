import { faker } from "@faker-js/faker/locale/pt_BR";
import StockNotFoundError from "@shared/StockNotFound";
import ScheduleHandler from "./ScheduleHandler";

describe('ScheduleHandler unit tests', () => {
  const alert_repository_mock = {
    createAlert: jest.fn(),
    deleteAlert: jest.fn(),
    getAlert: jest.fn(),
    listAlertsByUserId: jest.fn(),
    listAlerts: jest.fn(),
  };

  const stock_searcher_mock = {
    search: jest.fn(),
  };

  const handler = new ScheduleHandler(alert_repository_mock, stock_searcher_mock);

  beforeEach(() => {
    alert_repository_mock.listAlerts.mockClear();
    stock_searcher_mock.search.mockClear();
  });

  it("doesn't stop if some stock doesn't exist", async () => {
    expect.assertions(1);

    const alerts = [
      {
        id: faker.string.uuid(),
        stock: faker.string.alphanumeric(4),
        user_id: faker.string.uuid(),
        max_amount: 100,
        min_amount: 0,
      },
      {
        id: faker.string.uuid(),
        stock: faker.string.alphanumeric(4),
        user_id: faker.string.uuid(),
        max_amount: 0,
        min_amount: 10,
      }
    ];

    alert_repository_mock.listAlerts
      .mockResolvedValueOnce(alerts)
      .mockResolvedValueOnce([]);

    stock_searcher_mock.search
      .mockRejectedValueOnce(new StockNotFoundError('test'))
      .mockResolvedValueOnce({ amount: 101 });

    await expect(handler.handle()).resolves.not.toThrow();
  })

  it('sends a stock event for each confirmed stock amount', async () => {
    expect.assertions(11);

    const alerts = [
      {
        id: faker.string.uuid(),
        stock: faker.string.alphanumeric(4),
        user_id: faker.string.uuid(),
        max_amount: 100,
        min_amount: 0,
      },
      {
        id: faker.string.uuid(),
        stock: faker.string.alphanumeric(4),
        user_id: faker.string.uuid(),
        max_amount: 0,
        min_amount: 10,
      }
    ];

    alert_repository_mock.listAlerts
      .mockResolvedValueOnce(alerts)
      .mockResolvedValueOnce([]);


    stock_searcher_mock.search
      .mockResolvedValueOnce({ amount: 101 })
      .mockResolvedValueOnce({ amount: 9 });

    const emit_spy = jest.spyOn(handler, 'emit');

    await handler.handle();


    expect(emit_spy).toHaveBeenCalledTimes(2);

    expect(emit_spy.mock.calls[0][0]).toEqual('stock_event');
    expect(emit_spy.mock.calls[0][1].current_amount).toEqual(101);
    expect(emit_spy.mock.calls[0][1].user_id).toEqual(alerts[0].user_id);
    expect(typeof emit_spy.mock.calls[0][1].isMax).toEqual('boolean');
    expect(emit_spy.mock.calls[0][1].stock).toEqual(alerts[0].stock);

    expect(emit_spy.mock.calls[1][0]).toEqual('stock_event');
    expect(emit_spy.mock.calls[1][1].current_amount).toEqual(9);
    expect(emit_spy.mock.calls[1][1].user_id).toEqual(alerts[1].user_id);
    expect(typeof emit_spy.mock.calls[1][1].isMax).toEqual('boolean');
    expect(emit_spy.mock.calls[1][1].stock).toEqual(alerts[1].stock);
  });

  it("doesn't call stock_searcher.search twice if stock already had been searched", async () => {
    expect.assertions(1);

    const alerts = [
      {
        id: faker.string.uuid(),
        stock: 'test',
        user_id: faker.string.uuid(),
        max_amount: 100,
        min_amount: 0,
      },
      {
        id: faker.string.uuid(),
        stock: 'test',
        user_id: faker.string.uuid(),
        max_amount: 0,
        min_amount: 10,
      }
    ];

    alert_repository_mock.listAlerts
      .mockResolvedValueOnce(alerts)
      .mockResolvedValueOnce([]);

    stock_searcher_mock.search
      .mockResolvedValueOnce({ amount: 101 });

    await handler.handle();

    expect(stock_searcher_mock.search).toHaveBeenCalledTimes(1);
  });
});