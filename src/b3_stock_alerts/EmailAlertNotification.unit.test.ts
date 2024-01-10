/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from "@faker-js/faker/locale/pt_BR";
import nodemailer from 'nodemailer';
import { Alert } from "./Alert";
import { AlertNotificationTypes } from "./AlertNotification";
import EmailAlertNotification from "./EmailAlertNotification";
import { User } from "./User";

jest.mock('nodemailer');

const nodemailerMock = jest.mocked(nodemailer);
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
    const transporteMock = { sendMail: jest.fn() } as any;
    nodemailerMock.createTransport.mockReturnValue(transporteMock);
    const alertNotification = new EmailAlertNotification();

    afterEach(() => {
      transporteMock.sendMail.mockClear();
    });

    it('sends an email notification for MAX stock alert', async () => {
      expect.assertions(1);

      const alert: Alert = {
        id: faker.string.uuid(),
        stock: faker.string.alphanumeric(4),
        user_id: faker.string.uuid(),
        max_amount: faker.number.float(),
        min_amount: faker.number.float(),
      };

      const user: User = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(11),
        phone_number: faker.string.numeric(11),
      };

      await alertNotification.notify(alert, user, AlertNotificationTypes.MAX);

      expect(transporteMock.sendMail).toHaveBeenCalledWith({
        from: 'test@server.com',
        to: user.email,
        subject: "Alerta de aumento no valor da ação!",
        text: `A ação com sigla ${alert.stock} ultrapassou o valor de R$ ${alert.max_amount}.`,
        html: `<p>A ação com sigla ${alert.stock} ultrapassou o valor de R$ ${alert.max_amount}</p>`,
      });
    });

    it('sends an email notification for MIN stock alert', async () => {
      expect.assertions(1);

      const alert: Alert = {
        id: faker.string.uuid(),
        stock: faker.string.alphanumeric(4),
        user_id: faker.string.uuid(),
        max_amount: faker.number.float(),
        min_amount: faker.number.float(),
      };

      const user: User = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(11),
        phone_number: faker.string.numeric(11),
      };

      await alertNotification.notify(alert, user, AlertNotificationTypes.MIN);

      expect(transporteMock.sendMail).toHaveBeenCalledWith({
        from: 'test@server.com',
        to: user.email,
        subject: "Alerta de baixa no valor de ação!",
        text: `A ação com sigla ${alert.stock} está abaixo do valor de R$ ${alert.min_amount}.`,
        html: `<p>A ação com sigla ${alert.stock} está abaixo o valor de R$ ${alert.min_amount}</p>`,
      });
    });
  });
})