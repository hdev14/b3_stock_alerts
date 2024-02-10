/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from '@faker-js/faker/locale/pt_BR';
import Postgres from '@shared/Postgres';
import { Alert } from './Alert';
import PgAlertRepository from './PgAlertRepository';

const get_client_spy = jest.spyOn(Postgres, 'getClient');

afterEach(() => {
  get_client_spy.mockClear();
});

describe('PgAlertRepository', () => {
  const query_mock = jest.fn();
  get_client_spy.mockImplementation(() => ({ query: query_mock } as any));
  const repository = new PgAlertRepository();

  afterEach(() => {
    query_mock.mockClear();
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

      expect(query_mock).toHaveBeenCalledWith(
        'INSERT INTO alerts (id, stock, user_id, max_amount, min_amount) VALUES ($1, $2, $3, $4, $5)',
        [alert.id, alert.stock, alert.user_id, alert.max_amount, alert.min_amount],
      );
    });
  });

  describe('PgAlertRepository.deleteAlert', () => {
    it('deletes an alert by id', async () => {
      expect.assertions(1);

      const alert_id = faker.string.uuid();

      await repository.deleteAlert(alert_id);

      expect(query_mock).toHaveBeenCalledWith('DELETE FROM alerts WHERE id = $1', [alert_id]);
    });
  });

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

      query_mock.mockResolvedValueOnce({ rows: [alert] });

      const result = await repository.getAlert(alert.id);

      expect(query_mock).toHaveBeenCalledWith('SELECT id, stock, user_id, max_amount, min_amount FROM alerts WHERE id = $1', [alert.id]);
      expect(result).toEqual(alert);
    });

    it("returns NULL if alert doesn't exist", async () => {
      expect.assertions(2);

      query_mock.mockResolvedValueOnce({ rows: [] });

      const alert_id = faker.string.uuid();

      const result = await repository.getAlert(alert_id);

      expect(query_mock).toHaveBeenCalledWith('SELECT id, stock, user_id, max_amount, min_amount FROM alerts WHERE id = $1', [alert_id]);
      expect(result).toBeNull();
    });
  });

  describe('PgAlertRepository.listAlertsByUserId', () => {
    it('returns an array of alerts', async () => {
      expect.assertions(2);

      const user_id = faker.string.uuid();

      query_mock.mockResolvedValueOnce({
        rows: [
          {
            id: faker.string.uuid(),
            stock: faker.string.alphanumeric(6),
            user_id,
            max_amount: faker.number.float(),
            min_amount: faker.number.float(),
          },
          {
            id: faker.string.uuid(),
            stock: faker.string.alphanumeric(6),
            user_id,
            max_amount: faker.number.float(),
            min_amount: faker.number.float(),
          },
        ],
      });

      const alerts = await repository.listAlertsByUserId(user_id);

      expect(query_mock).toHaveBeenCalledWith('SELECT id, stock, user_id, max_amount, min_amount FROM alerts WHERE user_id = $1', [user_id]);
      expect(alerts).toHaveLength(2);
    });
  });

  describe('PgAlertRepository.listAlerts', () => {
    it('returns an array of alerts', async () => {
      expect.assertions(2);

      query_mock.mockResolvedValueOnce({
        rows: [
          {
            id: faker.string.uuid(),
            stock: faker.string.alphanumeric(6),
            user_id: faker.string.uuid(),
            max_amount: faker.number.float(),
            min_amount: faker.number.float(),
          },
          {
            id: faker.string.uuid(),
            stock: faker.string.alphanumeric(6),
            user_id: faker.string.uuid(),
            max_amount: faker.number.float(),
            min_amount: faker.number.float(),
          },
        ],
      });

      const limit = faker.number.int();
      const skip = faker.number.int();

      const alerts = await repository.listAlerts({ limit, skip });

      expect(query_mock).toHaveBeenCalledWith('SELECT id, stock, user_id, max_amount, min_amount FROM alerts LIMIT $1 OFFSET $2', [limit, skip]);
      expect(alerts).toHaveLength(2);
    });
  });
});
