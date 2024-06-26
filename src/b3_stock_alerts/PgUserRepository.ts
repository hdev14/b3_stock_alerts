import Postgres from '@shared/Postgres';
import { Client } from 'pg';
import { User } from './User';
import { UserConfirmationCode } from './UserConfirmationCode';
import UserRepository from './UserRepository';

export default class PgUserRepository implements UserRepository {
  private readonly client: Client;

  constructor() {
    this.client = Postgres.getClient();
  }

  async getUsers(): Promise<User[]> {
    const result = await this.client.query('SELECT id, email, name, password, phone_number FROM users');

    return result.rows;
  }

  async getUser(user_id: string): Promise<User | null> {
    const result = await this.client.query(
      'SELECT id, email, name, password, phone_number FROM users WHERE id = $1',
      [user_id],
    );

    if (result.rows[0] === undefined) {
      return null;
    }

    return result.rows[0];
  }

  async createUser(user: User): Promise<void> {
    await this.client.query(
      'INSERT INTO users (id, email, name, password, phone_number) VALUES ($1, $2, $3, $4, $5)',
      [user.id, user.email, user.name, user.password, user.phone_number],
    );
  }

  async updateUser(user: User): Promise<void> {
    const entries = Object.entries(user).filter(([key, value]) => key !== 'id' && !!value);

    const set = entries.reduce((acc, [key, value], index) => {
      if (value) {
        acc += `${key} = $${index + 2}`;
      }

      if (index + 1 < entries.length) {
        acc += ', ';
      }

      return acc;
    }, '');

    const values = entries.map(([, value]) => value);

    await this.client.query(
      `UPDATE users SET ${set} WHERE id = $1`,
      [user.id, ...values],
    );
  }

  async deleteUser(user_id: string): Promise<void> {
    await this.client.query('DELETE FROM users WHERE id = $1', [user_id]);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.client.query(
      'SELECT id, email, name, password, phone_number FROM users WHERE email = $1',
      [email],
    );

    if (result.rows[0] === undefined) {
      return null;
    }

    return result.rows[0];
  }

  async createConfirmationCode(confirmation_code: UserConfirmationCode): Promise<void> {
    const {
      id, user_id, code, expired_at,
    } = confirmation_code;
    await this.client.query(
      'INSERT INTO user_confirmation_codes (id, user_id, code, expired_at) VALUES ($1, $2, $3, $4)',
      [
        id,
        user_id,
        code,
        `${expired_at.getFullYear()}-${expired_at.getMonth() + 1}-${expired_at.getDate()} ${expired_at.getHours()}:${expired_at.getMinutes()}:${expired_at.getSeconds()}`,
      ],
    );
  }

  async getConfirmationCode(email: string, code: string): Promise<UserConfirmationCode | null> {
    const result = await this.client.query(
      'SELECT ucc.id, user_id, code, expired_at FROM user_confirmation_codes ucc JOIN users ON users.email = $1 WHERE code = $2',
      [email, code],
    );

    const confirmation_code = result.rows[0];

    if (confirmation_code === undefined) {
      return null;
    }

    confirmation_code.expired_at = new Date(confirmation_code.expired_at);

    return confirmation_code;
  }
}
