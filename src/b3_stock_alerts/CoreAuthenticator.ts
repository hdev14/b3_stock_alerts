/* eslint-disable @typescript-eslint/no-unused-vars */
import Authenticator from "./Authenticator";
import { User } from "./User";

export default class CoreAuthenticator implements Authenticator {
  generateAuthToken(user: User): Promise<string> {
    throw new Error("Method not implemented.");
  }

  verifyAuthToken(token: string): Promise<true> {
    throw new Error("Method not implemented.");
  }

  resetAuthToken(user: User, token: string): Promise<string> {
    throw new Error("Method not implemented.");
  }

  async verifyCaptcha(user_ip: string, token: string): Promise<boolean> {
    const params = new URLSearchParams({
      secret: process.env.GOOGLE_RECAPTCHA_SECRET!,
      response: token,
      remoteip: user_ip,
    }).toString();

    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    if (data['error-codes'] && data['error-codes'].length > 0) {
      throw new Error(`Google recaptcha bad request: [${data['error-codes'].join(',')}]`);
    }

    return data.success;
  }
}