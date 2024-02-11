import nodemailer, { Transporter } from 'nodemailer';
import AlertNotification, { AlertNotificationTypes, NotificationData } from './AlertNotification';
import ConfirmationCode, { SendCodeParams } from './ConfirmationCode';

export default class EmailGateway implements AlertNotification, ConfirmationCode {
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT!, 10),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async notify(data: NotificationData): Promise<void> {
    const message = {
      from: process.env.APPLICATION_EMAIL,
      to: data.user.email,
      subject: '',
      text: '',
      html: '',
    };

    if (data.type === AlertNotificationTypes.MAX) {
      message.subject = 'Alerta de aumento no valor da ação!';
      message.text = `A ação com sigla ${data.stock} ultrapassou o valor de R$ ${data.amount}.`;
      message.html = `<p>A ação com sigla ${data.stock} ultrapassou o valor de R$ ${data.amount}</p>`;
    } else {
      message.subject = 'Alerta de baixa no valor de ação!';
      message.text = `A ação com sigla ${data.stock} está abaixo do valor de R$ ${data.amount}.`;
      message.html = `<p>A ação com sigla ${data.stock} está abaixo o valor de R$ ${data.amount}</p>`;
    }

    await this.transporter.sendMail(message);
  }

  async sendCode(params: SendCodeParams): Promise<void> {
    const message = {
      from: process.env.APPLICATION_EMAIL,
      to: params.email,
      subject: 'Código de confirmação',
      text: `Segue o código de confirmação ${params.code}. Acesse o link ${process.env.SERVER_URL}/pages/confirm-code?email=${params.email}.`,
      html: `<p>Segue o código de confirmação ${params.code}.</p><br/><p>Acesse o link ${process.env.SERVER_URL}/pages/confirm-code?email=${params.email}.</p>`,
    };

    await this.transporter.sendMail(message);
  }
}
