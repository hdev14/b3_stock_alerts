import { faker } from "@faker-js/faker/locale/pt_BR";
import NotFoundError from "@shared/NotFoundError";
import AlertService from "./AlertService";

describe('AlertService', () => {
  const repositoryMock = {
    createAlert: jest.fn(),
    deleteAlert: jest.fn(),
    getAlert: jest.fn(),
  };

  const service = new AlertService(repositoryMock);

  describe('AlertService.createMaxAlert', () => {
    it('creates a new max alert', async () => {
      expect.assertions(6);

      const params = {
        user_id: faker.string.uuid(),
        amount: faker.number.float(),
        stock: faker.string.alphanumeric(4),
      };

      const result = await service.createMaxAlert(params);

      if (result.data) {
        expect(repositoryMock.createAlert).toHaveBeenCalled();
        expect(result.data.id).toBeDefined();
        expect(result.data.max_amount).toEqual(params.amount);
        expect(result.data.min_amount).toBeUndefined();
        expect(result.data.user_id).toEqual(params.user_id);
        expect(result.data.stock).toEqual(params.stock);
      }
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

      const result = await service.createMinAlert(params);

      if (result.data) {
        expect(repositoryMock.createAlert).toHaveBeenCalled();
        expect(result.data.id).toBeDefined();
        expect(result.data.max_amount).toBeUndefined();
        expect(result.data.min_amount).toEqual(params.amount);
        expect(result.data.user_id).toEqual(params.user_id);
        expect(result.data.stock).toEqual(params.stock);
      }
    });
  });

  describe('AlertService.removeAlert', () => {
    afterEach(() => {
      repositoryMock.deleteAlert.mockClear();
      repositoryMock.getAlert.mockClear();
    });

    it("returns a Result with NotFoundError if alert doesn't exist", async () => {
      expect.assertions(2);

      const alert_id = faker.string.uuid();

      repositoryMock.getAlert.mockResolvedValueOnce(null);

      const result = await service.removeAlert(alert_id);

      if (result) {
        expect(repositoryMock.getAlert).toHaveBeenCalledWith(alert_id);
        expect(result.error).toBeInstanceOf(NotFoundError);
      }
    });

    it("removes an alert", async () => {
      expect.assertions(2);

      const alert_id = faker.string.uuid();

      repositoryMock.getAlert.mockResolvedValueOnce({
        id: faker.string.uuid(),
        stock: faker.string.alphanumeric(4),
        user_id: faker.string.uuid(),
        min_amount: faker.number.float(),
      });

      const result = await service.removeAlert(alert_id);

      expect(repositoryMock.getAlert).toHaveBeenCalledWith(alert_id);
      expect(result).toBeUndefined();
    });
  });
});