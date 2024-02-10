import CredentialError from '@shared/CredentialError';
import { Result } from '@shared/generic_types';
import Authenticator from './Authenticator';
import Encryptor from './Encryptor';
import { User } from './User';
import UserRepository from './UserRepository';

type LoginResult = {
  user: User;
  token: string;
  expired_at: Date;
};

export default class AuthService {
  constructor(
    private readonly user_repository: UserRepository,
    private readonly encryptor: Encryptor,
    private readonly authenticator: Authenticator,
  ) { }

  async login(email: string, password: string): Promise<Result<LoginResult>> {
    const user = await this.user_repository.getUserByEmail(email);

    if (!user) {
      return { error: new CredentialError() };
    }

    if (!this.encryptor.compareHash(password, user.password)) {
      return { error: new CredentialError() };
    }

    const auth_data = this.authenticator.generateAuthToken(user);

    return {
      data: {
        user,
        token: auth_data.token,
        expired_at: auth_data.expired_at,
      },
    };
  }

  async verifyCaptcha(user_ip: string, token: string): Promise<Result<boolean>> {
    return { data: await this.authenticator.verifyCaptcha(user_ip, token) };
  }
}
