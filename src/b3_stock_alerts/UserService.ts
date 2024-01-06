import Result from "@shared/Result";
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
  phone_number?: string;
};

export default class UserService {
  constructor(readonly repository: UserRepository) {}

  getUser(user_id: string): Promise<Result<User>> {
    throw new Error('not implemented');
  }

  listUsers(): Promise<Result<Array<User>>> {
    throw new Error('not implemented');
  }

  createUser(params: CreateUserParams): Promise<Result<User>> {
    throw new Error('not implemented');
  }

  updateUser(params: UpdateUserParams): Promise<Result<User>> {
    throw new Error('not implemented');
  }

  removeUser(user_id: string): Promise<Result> {
    throw new Error('not implemented');
  }
}