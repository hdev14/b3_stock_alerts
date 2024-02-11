import { User } from './User';
import { UserConfirmationCode } from './UserConfirmationCode';

export default interface UserRepository {
  getUsers(): Promise<Array<User>>;
  getUser(user_id: string): Promise<User | null>;
  createUser(user: User): Promise<void>;
  updateUser(user: User): Promise<void>;
  deleteUser(user_id: string): Promise<void>;
  getUserByEmail(email: string): Promise<User | null>;
  createConfirmationCode(confirmation_code: UserConfirmationCode): Promise<void>;
}
