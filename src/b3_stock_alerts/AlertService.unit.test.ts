import { faker } from '@faker-js/faker/locale/pt_BR';
import NotFoundError from '@shared/NotFoundError';
import AlertService from './AlertService';

describe('AlertService', () => {
  const alert_repository_mock = {
    createAlert: jest.fn(),
    deleteAlert: jest.fn(),
    getAlert: jest.fn(),
    listAlertsByUserId: jest.fn(),
    listAlerts: jest.fn(),
  };

  const user_repository_mock = {
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    getUser: jest.fn(),
    getUsers: jest.fn(),
    updateUser: jest.fn(),
    getUserByEmail: jest.fn(),
    createConfirmationCode: jest.fn(),
    getConfirmationCode: jest.fn(),
  };

  const service = new AlertService(alert_repository_mock, user_repository_mock);

  describe('AlertService.createMaxAlert', () => {
    it('creates a new max alert', async () => {
      expect.assertions(6);

      const params = {
        user_id: faker.string.uuid(),
        amount: faker.number.float(),
        stock: faker.string.alphanumeric(4),
      };

      user_repository_mock.getUser.mockResolvedValueOnce({ id: faker.string.uuid() });

      const [, data] = await service.createMaxAlert(params);

      if (data) {
        expect(alert_repository_mock.createAlert).toHaveBeenCalled();
        expect(data.id).toBeDefined();
        expect(data.max_amount).toEqual(params.amount);
        expect(data.min_amount).toBeUndefined();
        expect(data.user_id).toEqual(params.user_id);
        expect(data.stock).toEqual(params.stock);
      }
    });

    it("returns a result with NotFoundError if userr doesn't exist", async () => {
      expect.assertions(1);

      const params = {
        user_id: faker.string.uuid(),
        amount: faker.number.float(),
        stock: faker.string.alphanumeric(4),
      };

      user_repository_mock.getUser.mockResolvedValueOnce(null);

      const [error] = await service.createMaxAlert(params);

      expect(error).toBeInstanceOf(NotFoundError);
    });
  });

  describe('AlertService.createMinAlert', () => {
    it('creates a new min alert', async () => {
      expect.assertions(6);

      const params = {
        user_id: faker.string.uuid(),
        amount: faker.number.float(),
        stock: faker.string.alphanumeric(4),
      };

      user_repository_mock.getUser.mockResolvedValueOnce({ id: faker.string.uuid() });

      const [, data] = await service.createMinAlert(params);

      if (data) {
        expect(alert_repository_mock.createAlert).toHaveBeenCalled();
        expect(data.id).toBeDefined();
        expect(data.max_amount).toBeUndefined();
        expect(data.min_amount).toEqual(params.amount);
        expect(data.user_id).toEqual(params.user_id);
        expect(data.stock).toEqual(params.stock);
      }
    });

    it("returns a result with NotFoundError if user doesn't exist", async () => {
      expect.assertions(1);

      const params = {
        user_id: faker.string.uuid(),
        amount: faker.number.float(),
        stock: faker.string.alphanumeric(4),
      };

      user_repository_mock.getUser.mockResolvedValueOnce(null);

      const [error] = await service.createMinAlert(params);

      expect(error).toBeInstanceOf(NotFoundError);
    });
  });

  describe('AlertService.removeAlert', () => {
    afterEach(() => {
      alert_repository_mock.deleteAlert.mockClear();
      alert_repository_mock.getAlert.mockClear();
    });

    it("returns a Result with NotFoundError if alert doesn't exist", async () => {
      expect.assertions(2);

      const alert_id = faker.string.uuid();

      alert_repository_mock.getAlert.mockResolvedValueOnce(null);

      const [error] = await service.removeAlert(alert_id);

      expect(alert_repository_mock.getAlert).toHaveBeenCalledWith(alert_id);
      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('removes an alert', async () => {
      expect.assertions(2);

      const alert_id = faker.string.uuid();

      alert_repository_mock.getAlert.mockResolvedValueOnce({
        id: faker.string.uuid(),
        stock: faker.string.alphanumeric(4),
        user_id: faker.string.uuid(),
        min_amount: faker.number.float(),
      });

      const [, data] = await service.removeAlert(alert_id);

      expect(alert_repository_mock.getAlert).toHaveBeenCalledWith(alert_id);
      expect(data).toEqual({});
    });
  });

  describe('AlertService.listUserAlerts', () => {
    it("returns a result with a NotFoundError if user doesn't exist", async () => {
      expect.assertions(2);

      user_repository_mock.getUser.mockResolvedValueOnce(null);

      const [error, data] = await service.listUserAlerts(faker.string.uuid());

      expect(error).toBeInstanceOf(NotFoundError);
      expect(data).toEqual({});
    });

    it('returns a result with an array of alerts', async () => {
      expect.assertions(2);

      user_repository_mock.getUser.mockResolvedValueOnce({ id: faker.string.uuid() });
      alert_repository_mock.listAlertsByUserId.mockResolvedValueOnce([
        {
          id: faker.string.uuid(),
          stock: faker.string.alphanumeric(4),
          user_id: faker.string.uuid(),
          max_amount: faker.number.float(),
          min_amount: faker.number.float(),
        },
        {
          id: faker.string.uuid(),
          stock: faker.string.alphanumeric(4),
          user_id: faker.string.uuid(),
          max_amount: faker.number.float(),
          min_amount: faker.number.float(),
        },
      ]);

      const [error, data] = await service.listUserAlerts(faker.string.uuid());

      expect(error).toBeUndefined();
      expect(data).toHaveLength(2);
    });
  });
});
