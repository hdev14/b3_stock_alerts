/* eslint-disable @typescript-eslint/no-unused-vars */
import jwt from 'jsonwebtoken';
import Authenticator, { AuthData } from './Authenticator';
import { User } from './User';

export default class CoreAuthenticator implements Authenticator {
  generateAuthToken(user: User): AuthData {
    const expires_in = 60 * 60; // 1h

    const token = jwt.sign(user, process.env.JWT_PRIVATE_KEY!, {
      expiresIn: expires_in,
    });

    const expired_at = new Date();
    expired_at.setHours(expired_at.getHours() + expires_in);

    return { token, expired_at };
  }

  verifyAuthToken(token: string): true {
    throw new Error('Method not implemented.');
  }

  resetAuthToken(user: User, token: string): string {
    throw new Error('Method not implemented.');
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
        Accept: 'application/json',
      },
    });

    const data = await response.json();

    if (data['error-codes'] && data['error-codes'].length > 0) {
      throw new Error(`Google recaptcha bad request: [${data['error-codes'].join(',')}]`);
    }

    return data.success;
  }
}
