import { User } from './User';

export type AuthData = {
  token: string;
  expired_at: Date;
};

export type UserData = Omit<User, 'password'>;

interface Authenticator {
  generateAuthToken(user: UserData): AuthData;
  verifyAuthToken(token: string): UserData | null;
  resetAuthToken(user: User, token: string): string;
  verifyCaptcha(user_ip: string, token: string): Promise<boolean>;
}

export default Authenticator;
