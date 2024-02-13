import CredentialError from '@shared/CredentialError';
import NotFoundError from '@shared/NotFoundError';
import { Result } from '@shared/generic_types';
import { randomInt, randomUUID } from 'crypto';
import Authenticator from './Authenticator';
import ConfirmationCode from './ConfirmationCode';
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
    private readonly confirmation_code: ConfirmationCode,
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

  async sendConfirmationCode(email: string): Promise<Result<void>> {
    const user = await this.user_repository.getUserByEmail(email);

    if (!user) {
      return { error: new NotFoundError('Usuário não encontrado.') };
    }

    const code = randomInt(1000, 9999).toString();
    const expired_at = new Date();
    expired_at.setMinutes(expired_at.getMinutes() + 10);

    await this.confirmation_code.sendCode({ email, code });

    await this.user_repository.createConfirmationCode({
      id: randomUUID(),
      user_id: user.id,
      code,
      expired_at,
    });

    return {};
  }

  async confirmCode(email: string, code: string): Promise<Result<boolean>> {
    const confirmation_code = await this.user_repository.getConfirmationCode(email, code);

    return { data: !!confirmation_code };
  }
}
