/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from '@faker-js/faker/locale/pt_BR';
import nodemailer from 'nodemailer';
import { AlertNotificationTypes, NotificationData } from './AlertNotification';
import EmailAlertNotification from './EmailAlertNotification';

jest.mock('nodemailer');

const nodemailer_mock = jest.mocked(nodemailer);
describe('EmailAlertNotification', () => {
  const OLD_ENV = process.env;

  beforeAll(() => {
    process.env = {
      APPLICATION_EMAIL: 'test@server.com',
      EMAIL_HOST: 'test',
      EMAIL_PORT: '123',
      EMAIL_USER: 'test',
      EMAIL_PASSWORD: 'test',
    };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('EmailAlertNotification.notify', () => {
    const transport_mock = { sendMail: jest.fn() } as any;
    nodemailer_mock.createTransport.mockReturnValue(transport_mock);
    const alert_notification = new EmailAlertNotification();

    afterEach(() => {
      transport_mock.sendMail.mockClear();
    });

    it('sends an email notification for MAX stock alert', async () => {
      expect.assertions(1);

      const data: NotificationData = {
        stock: faker.string.alphanumeric(4),
        amount: faker.number.float(),
        user: {
          id: faker.string.uuid(),
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: faker.string.alphanumeric(11),
          phone_number: faker.string.numeric(11),
        },
        type: AlertNotificationTypes.MAX,
      };

      await alert_notification.notify(data);

      expect(transport_mock.sendMail).toHaveBeenCalledWith({
        from: 'test@server.com',
        to: data.user.email,
        subject: 'Alerta de aumento no valor da ação!',
        text: `A ação com sigla ${data.stock} ultrapassou o valor de R$ ${data.amount}.`,
        html: `<p>A ação com sigla ${data.stock} ultrapassou o valor de R$ ${data.amount}</p>`,
      });
    });

    it('sends an email notification for MIN stock alert', async () => {
      expect.assertions(1);

      const data: NotificationData = {
        stock: faker.string.alphanumeric(4),
        amount: faker.number.float(),
        user: {
          id: faker.string.uuid(),
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: faker.string.alphanumeric(11),
          phone_number: faker.string.numeric(11),
        },
        type: AlertNotificationTypes.MIN,
      };

      await alert_notification.notify(data);

      expect(transport_mock.sendMail).toHaveBeenCalledWith({
        from: 'test@server.com',
        to: data.user.email,
        subject: 'Alerta de baixa no valor de ação!',
        text: `A ação com sigla ${data.stock} está abaixo do valor de R$ ${data.amount}.`,
        html: `<p>A ação com sigla ${data.stock} está abaixo o valor de R$ ${data.amount}</p>`,
      });
    });
  });
});
