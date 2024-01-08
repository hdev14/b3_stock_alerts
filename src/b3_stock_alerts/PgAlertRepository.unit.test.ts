/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from "@faker-js/faker/locale/pt_BR";
import Postgres from "@shared/Postgres";
import { Alert } from "./Alert";
import PgAlertRepository from './PgAlertRepository';

const getClientSpy = jest.spyOn(Postgres, 'getClient');

afterEach(() => {
  getClientSpy.mockClear();
});

describe('PgAlertRepository', () => {
  const queryMock = jest.fn();
  getClientSpy.mockImplementation(() => ({ query: queryMock } as any));
  const repository = new PgAlertRepository();

  afterEach(() => {
    queryMock.mockClear();
  });

  describe('PgAlertRepository.createAlert', () => {
    it('inserts a new alert', async () => {
      expect.assertions(1);

      const alert: Alert = {
        id: faker.string.uuid(),
        stock: faker.string.alphanumeric(4),
        user_id: faker.string.uuid(),
        max_amount: faker.number.float(),
        min_amount: faker.number.float(),
      };

      await repository.createAlert(alert);

      expect(queryMock).toHaveBeenCalledWith(
        'INSERT INTO alerts (id, stock, user_id, max_amount, min_amount) VALUES ($1, $2, $3, $4, $5)',
        [alert.id, alert.stock, alert.user_id, alert.max_amount, alert.min_amount]
      );
    });
  });

  describe('PgAlertRepository.deleteAlert', () => {
    it('deletes an alert by id', async () => {
      expect.assertions(1);

      const alert_id = faker.string.uuid();

      await repository.deleteAlert(alert_id);

      expect(queryMock).toHaveBeenCalledWith('DELETE FROM alerts WHERE id = $1', [alert_id]);
    });
  })

  describe('PgAlertRepository.getAlert', () => {
    it('returns an alert by id', async () => {
      expect.assertions(2);

      const alert: Alert = {
        id: faker.string.uuid(),
        stock: faker.string.alphanumeric(4),
        user_id: faker.string.uuid(),
        max_amount: faker.number.float(),
        min_amount: faker.number.float(),
      };

      queryMock.mockResolvedValueOnce({ rows: [alert]});

      const result = await repository.getAlert(alert.id);

      expect(queryMock).toHaveBeenCalledWith('SELECT id, stock, user_id, max_amount, min_amount FROM alerts WHERE id = $1', [alert.id]);
      expect(result).toEqual(alert);
    });

    it("returns NULL if alert doesn't exist", async () => {
      expect.assertions(2);

      queryMock.mockResolvedValueOnce({ rows: []  });

      const alert_id = faker.string.uuid();

      const result = await repository.getAlert(alert_id);

      expect(queryMock).toHaveBeenCalledWith('SELECT id, stock, user_id, max_amount, min_amount FROM alerts WHERE id = $1', [alert_id]);
      expect(result).toBeNull();
    });
  });
});