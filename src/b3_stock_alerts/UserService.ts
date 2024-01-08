import NotFoundError from "@shared/NotFoundError";
import Result from "@shared/Result";
import { randomUUID } from "crypto";
import Encryptor from "./Encryptor";
import { User } from "./User";
import UserRepository from "./UserRepository";

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
      return {
        error: new NotFoundError('User not found'),
      };
    }

    return { data: user };
  }

  async listUsers(): Promise<Result<Array<User>>> {
    const users = await this.repository.getUsers();

    return { data: users };
  }

  async createUser(params: CreateUserParams): Promise<Result<User>> {
    const passwordHash = this.encryptor.createHash(params.password);

    const user: User = {
      id: randomUUID(),
      email: params.email,
      name: params.name,
      password: passwordHash,
      phone_number: params.phone_number,
    };

    await this.repository.createUser(user);

    return { data: user };
  }

  async updateUser({ user_id, ...rest }: UpdateUserParams): Promise<Result<User>> {
    const user = await this.repository.getUser(user_id);

    if (!user) {
      return { error: new NotFoundError('User not found') };
    }

    if (rest.password) {
      user.password = this.encryptor.createHash(rest.password);
    }

    const newData = Object.assign({}, user, rest);

    await this.repository.updateUser(newData);

    return { data: newData };
  }

  async removeUser(user_id: string): Promise<Result | void> {
    if (!await this.repository.getUser(user_id)) {
      return { error: new NotFoundError('User not found') };
    }

    await this.repository.deleteUser(user_id);
  }
}