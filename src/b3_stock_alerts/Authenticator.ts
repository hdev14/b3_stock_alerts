import { User } from "./User";

interface Authenticator {
  generateAuthToken(user: User): Promise<string>;
  verifyAuthToken(token: string): Promise<true>;
  resetAuthToken(user: User, token: string): Promise<string>;
  verifyCaptcha(user_ip: string, token: string): Promise<boolean>;
}

export default Authenticator;