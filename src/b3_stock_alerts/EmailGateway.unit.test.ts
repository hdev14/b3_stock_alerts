/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from '@faker-js/faker/locale/pt_BR';
import nodemailer from 'nodemailer';
import { AlertNotificationTypes, NotificationData } from './AlertNotification';
import EmailGateway from './EmailGateway';

jest.mock('nodemailer');

const nodemailer_mock = jest.mocked(nodemailer);

describe("EmailGateway's unit tests", () => {
  const OLD_ENV = process.env;
  const transport_mock = { sendMail: jest.fn() } as any;
  nodemailer_mock.createTransport.mockReturnValue(transport_mock);
  const email_gateway = new EmailGateway();

  afterEach(() => {
    transport_mock.sendMail.mockClear();
  });

  beforeAll(() => {
    process.env = {
      APPLICATION_EMAIL: 'test@server.com',
      EMAIL_HOST: 'test',
      EMAIL_PORT: '123',
      EMAIL_USER: 'test',
      EMAIL_PASSWORD: 'test',
      SERVER_URL: 'http://localhost:5000',
    };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('EmailGateway.notify', () => {
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

      await email_gateway.notify(data);

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

      await email_gateway.notify(data);

      expect(transport_mock.sendMail).toHaveBeenCalledWith({
        from: 'test@server.com',
        to: data.user.email,
        subject: 'Alerta de baixa no valor de ação!',
        text: `A ação com sigla ${data.stock} está abaixo do valor de R$ ${data.amount}.`,
        html: `<p>A ação com sigla ${data.stock} está abaixo o valor de R$ ${data.amount}</p>`,
      });
    });
  });

  describe('EmailGateway.notify', () => {
    it('sends an email for code confirmation', async () => {
      expect.assertions(1);

      const email = faker.internet.email();
      const code = faker.string.alphanumeric();

      await email_gateway.sendCode({ email, code });

      expect(transport_mock.sendMail).toHaveBeenCalledWith({
        from: 'test@server.com',
        to: email,
        subject: 'Código de confirmação',
        text: `Segue o código de confirmação ${code}. Acesse o link http://localhost:5000/pages/confirm-code?email=${email}. O código expira em 10 minutos.`,
        html: `<p>Segue o código de confirmação ${code}.</p><p>Acesse o <a href="http://localhost:5000/pages/confirm-code?email=${email}">link.</a></p><p>O código expira em 10 minutos.</p>`,
      });
    });
  });
});
