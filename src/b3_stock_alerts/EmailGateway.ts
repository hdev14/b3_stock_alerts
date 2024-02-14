import nodemailer, { Transporter } from 'nodemailer';
import AlertNotification, { AlertNotificationTypes, NotificationData } from './AlertNotification';
import ConfirmationCode, { SendCodeParams } from './ConfirmationCode';
import ForgotPassword, { ForgotPasswordParams } from './ForgotPassword';

export default class EmailGateway implements AlertNotification, ConfirmationCode, ForgotPassword {
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT!, 10),
      secure: process.env.NODE_ENV === 'production',
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
      text: `Segue o código de confirmação ${params.code}. Acesse o link ${process.env.SERVER_URL}/pages/confirm-code?email=${params.email}. O código expira em 10 minutos.`,
      html: `<p>Segue o código de confirmação ${params.code}.</p><p>Acesse o <a href="${process.env.SERVER_URL}/pages/confirm-code?email=${params.email}">link.</a></p><p>O código expira em 10 minutos.</p>`,
    };

    await this.transporter.sendMail(message);
  }

  async sendForgotPasswordLink(params: ForgotPasswordParams): Promise<void> {
    const message = {
      from: process.env.APPLICATION_EMAIL,
      to: params.email,
      subject: 'Esqueceu a senha?',
      text: `Acesse o link ${process.env.SERVER_URL}/pages/forgot-password?user_id=${params.user_id} para redefinir sua senha.`,
      html: `<p>Acesse o <a href="${process.env.SERVER_URL}/pages/forgot-password?user_id=${params.user_id}">link</a> para redefinir sua senha.</p>`,
    };

    await this.transporter.sendMail(message);
  }
}
