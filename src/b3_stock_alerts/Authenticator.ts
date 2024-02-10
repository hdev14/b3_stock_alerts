import { User } from './User';

export type AuthData = {
  token: string;
  expired_at: Date;
};

interface Authenticator {
  generateAuthToken(user: User): AuthData;
  verifyAuthToken(token: string): true;
  resetAuthToken(user: User, token: string): string;
  verifyCaptcha(user_ip: string, token: string): Promise<boolean>;
}

export default Authenticator;
