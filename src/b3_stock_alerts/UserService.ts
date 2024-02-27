import EmailAlreadyRegisteredError from '@shared/EmailAlreadyRegisteredError';
import NotFoundError from '@shared/NotFoundError';
import { Result, error, success } from '@shared/Result';
import { randomUUID } from 'crypto';
import Encryptor from './Encryptor';
import { User } from './User';
import UserRepository from './UserRepository';

export type CreateUserParams = {
  name: string;
  email: string;
  phone_number: string;
  password: string;
};

export type UpdateUserParams = {
  user_id: string;
  name?: string;
  email?: string;
  password?: string;
  phone_number?: string;
};

export default class UserService {
  constructor(readonly repository: UserRepository, readonly encryptor: Encryptor) { }

  async getUser(user_id: string): Promise<Result<User>> {
    const user = await this.repository.getUser(user_id);

    if (!user) {
      return error(new NotFoundError('Usuário não encontrado'));
    }

    return success(user);
  }

  async listUsers(): Promise<Result<Array<User>>> {
    const users = await this.repository.getUsers();

    return success(users);
  }

  async createUser(params: CreateUserParams): Promise<Result<User>> {
    if (await this.repository.getUserByEmail(params.email)) {
      return error(new EmailAlreadyRegisteredError());
    }

    const password_hash = this.encryptor.createHash(params.password);

    const user: User = {
      id: randomUUID(),
      email: params.email,
      name: params.name,
      password: password_hash,
      phone_number: params.phone_number,
    };

    await this.repository.createUser(user);

    return success(user);
  }

  async updateUser({ user_id, ...rest }: UpdateUserParams): Promise<Result<User>> {
    const user = await this.repository.getUser(user_id);

    if (!user) {
      return error(new NotFoundError('Usuário não encontrado'));
    }

    if (rest.password) {
      user.password = this.encryptor.createHash(rest.password);
    }

    const new_data = { ...user, ...rest };

    await this.repository.updateUser(new_data);

    return success(new_data);
  }

  async removeUser(user_id: string): Promise<Result<void>> {
    if (!await this.repository.getUser(user_id)) {
      return error(new NotFoundError('Usuário não encontrado'));
    }

    await this.repository.deleteUser(user_id);

    return success();
  }
}
