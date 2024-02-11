import { faker } from '@faker-js/faker/locale/pt_BR';
import { StockEvent } from '@shared/generic_types';
import { AlertNotificationTypes } from './AlertNotification';
import StockEventHandler from './StockEventHandler';

describe("StockEventHandler's unit tests", () => {
  const alert_notification_mock = {
    notify: jest.fn(),
  };

  const user_repository_mock = {
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    getUser: jest.fn(),
    updateUser: jest.fn(),
    getUsers: jest.fn(),
    getUserByEmail: jest.fn(),
    createConfirmationCode: jest.fn(),
  };

  const handler = new StockEventHandler(alert_notification_mock, user_repository_mock);

  it('calls alert_notification.notify with correct params when is a MAX stock event', async () => {
    expect.assertions(1);

    const user = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone_number: faker.string.numeric(11),
      password: faker.string.alphanumeric(10),
    };

    user_repository_mock.getUser.mockResolvedValueOnce(user);

    const event: StockEvent = {
      current_amount: faker.number.float(),
      isMax: true,
      stock: faker.string.alphanumeric(6),
      user_id: faker.string.uuid(),
    };

    await handler.handle(event);

    expect(alert_notification_mock.notify).toHaveBeenCalledWith({
      amount: event.current_amount,
      type: AlertNotificationTypes.MAX,
      stock: event.stock,
      user,
    });
  });

  it('calls alert_notification.notify with correct params when is a MIN stock event', async () => {
    expect.assertions(1);

    const user = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone_number: faker.string.numeric(11),
      password: faker.string.alphanumeric(10),
    };

    user_repository_mock.getUser.mockResolvedValueOnce(user);

    const event: StockEvent = {
      current_amount: faker.number.float(),
      isMax: false,
      stock: faker.string.alphanumeric(6),
      user_id: faker.string.uuid(),
    };

    await handler.handle(event);

    expect(alert_notification_mock.notify).toHaveBeenCalledWith({
      amount: event.current_amount,
      type: AlertNotificationTypes.MIN,
      stock: event.stock,
      user,
    });
  });
});
