import nodemailer, { Transporter } from 'nodemailer';
import AlertNotification, { AlertNotificationTypes, NotificationData } from "./AlertNotification";

export default class EmailAlertNotification implements AlertNotification {
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
      from: 'test@server.com',
      to: data.user.email,
      subject: '',
      text: '',
      html: '',
    };

    if (data.type === AlertNotificationTypes.MAX) {
      message.subject = "Alerta de aumento no valor da ação!";
      message.text = `A ação com sigla ${data.stock} ultrapassou o valor de R$ ${data.amount}.`;
      message.html = `<p>A ação com sigla ${data.stock} ultrapassou o valor de R$ ${data.amount}</p>`;
    } else {
      message.subject = "Alerta de baixa no valor de ação!";
      message.text = `A ação com sigla ${data.stock} está abaixo do valor de R$ ${data.amount}.`;
      message.html = `<p>A ação com sigla ${data.stock} está abaixo o valor de R$ ${data.amount}</p>`;
    }

    await this.transporter.sendMail(message);
  }
}