import nodemailer, { Transporter } from 'nodemailer';
import { Alert } from "./Alert";
import AlertNotification, { AlertNotificationTypes } from "./AlertNotification";
import { User } from "./User";

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

  async notify(alert: Alert, user: User, type: AlertNotificationTypes): Promise<void> {
    const message = {
      from: 'test@server.com',
      to: user.email,
      subject: '',
      text: '',
      html: '',
    };

    if (type === AlertNotificationTypes.MAX) {
      message.subject = "Alerta de aumento no valor da ação!";
      message.text = `A ação com sigla ${alert.stock} ultrapassou o valor de R$ ${alert.max_amount}.`;
      message.html = `<p>A ação com sigla ${alert.stock} ultrapassou o valor de R$ ${alert.max_amount}</p>`;
    } else {
      message.subject = "Alerta de baixa no valor de ação!";
      message.text = `A ação com sigla ${alert.stock} está abaixo do valor de R$ ${alert.min_amount}.`;
      message.html = `<p>A ação com sigla ${alert.stock} está abaixo o valor de R$ ${alert.min_amount}</p>`;
    }
    
    await this.transporter.sendMail(message);
  }
}