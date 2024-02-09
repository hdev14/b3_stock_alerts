/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from '@faker-js/faker/locale/pt_BR';
import Postgres from "@shared/Postgres";
import PgUserRepository from './PgUserRepository';
import { User } from "./User";

const get_client_spy = jest.spyOn(Postgres, 'getClient');

afterEach(() => {
  get_client_spy.mockClear();
});

describe('PgUserRepository', () => {
  const query_mock = jest.fn();
  get_client_spy.mockImplementation(() => ({ query: query_mock } as any));
  const repository = new PgUserRepository();

  afterEach(() => {
    query_mock.mockClear();
  });

  describe('PgUserRepository.createUser', () => {
    it('inserts a new user', async () => {
      expect.assertions(1);

      const user: User = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(10),
        phone_number: faker.string.numeric(11),
      };

      await repository.createUser(user);

      expect(query_mock).toHaveBeenCalledWith('INSERT INTO users (id, email, name, password, phone_number) VALUES ($1, $2, $3, $4, $5)', [
        user.id, user.email, user.name, user.password, user.phone_number,
      ]);
    });
  });

  describe('PgUserRepository.updateUser', () => {
    it('updates an user', async () => {
      expect.assertions(1);

      const user: User = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(10),
        phone_number: faker.string.numeric(11),
      };

      await repository.updateUser(user);

      expect(query_mock).toHaveBeenCalledWith('UPDATE users SET email = $2, name = $3, password = $4, phone_number = $5 WHERE id = $1', [
        user.id, user.email, user.name, user.password, user.phone_number,
      ]);
    });
  });

  describe('PgUserRepository.getUser', () => {
    it('returns an user by id', async () => {
      expect.assertions(2);

      const user: User = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(10),
        phone_number: faker.string.numeric(11),
      };

      query_mock.mockResolvedValueOnce({ rows: [user] });

      const result = await repository.getUser(user.id);

      expect(query_mock).toHaveBeenCalledWith('SELECT id, email, name, password, phone_number FROM users WHERE id = $1', [user.id]);
      expect(result).toEqual(user);
    });

    it("returns NULL if user doesn't exit", async () => {
      expect.assertions(2);

      const user_id = faker.string.uuid();

      query_mock.mockResolvedValueOnce({ rows: [] });

      const result = await repository.getUser(user_id);

      expect(query_mock).toHaveBeenCalledWith('SELECT id, email, name, password, phone_number FROM users WHERE id = $1', [user_id]);
      expect(result).toBeNull();
    });
  });

  describe('PgUserRepository.getUsers', () => {
    it('returns an array of users', async () => {
      expect.assertions(2);

      const users: Array<User> = [
        {
          id: faker.string.uuid(),
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: faker.string.alphanumeric(10),
          phone_number: faker.string.numeric(11),
        },
        {
          id: faker.string.uuid(),
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: faker.string.alphanumeric(10),
          phone_number: faker.string.numeric(11),
        }
      ];

      query_mock.mockResolvedValueOnce({ rows: users });

      const result = await repository.getUsers();

      expect(query_mock).toHaveBeenCalledWith('SELECT id, email, name, password, phone_number FROM users');
      expect(result).toEqual(users);
    });
  });

  describe('PgUserRepository.deleteUser', () => {
    it('deletes an user by id', async () => {
      expect.assertions(1);

      const user_id = faker.string.uuid();

      await repository.deleteUser(user_id);

      expect(query_mock).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', [user_id]);
    });
  });

  describe('PgUserRepository.getUserByEmail', () => {
    it('returns an user by email', async () => {
      expect.assertions(2);

      const user: User = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(10),
        phone_number: faker.string.numeric(11),
      };

      query_mock.mockResolvedValueOnce({ rows: [user] });

      const result = await repository.getUserByEmail(user.email);

      expect(query_mock).toHaveBeenCalledWith('SELECT id, email, name, password, phone_number FROM users WHERE email = $1', [user.email]);
      expect(result).toEqual(user);
    });

    it("returns NULL if user doesn't exit", async () => {
      expect.assertions(2);

      const user_email = faker.internet.email();

      query_mock.mockResolvedValueOnce({ rows: [] });

      const result = await repository.getUserByEmail(user_email);

      expect(query_mock).toHaveBeenCalledWith('SELECT id, email, name, password, phone_number FROM users WHERE email = $1', [user_email]);
      expect(result).toBeNull();
    });
  });
})